"""Migrate every public blog article listed in the original Teramis sitemap.

Original HTML is cached for reproducible imports. No scripts, forms, tracking,
or arbitrary HTML are retained; article bodies become typed content blocks.
"""
import json, re, html, hashlib, urllib.request, xml.etree.ElementTree as ET, importlib.util
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit, urljoin
spec = importlib.util.spec_from_file_location('refresh_content', Path(__file__).with_name('refresh-content.py'))
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)
Parser, Node, ROOT = refresh.Parser, refresh.Node, refresh.ROOT

CACHE = ROOT / '.tooling' / 'articles'
local_paths = {p['path'] for p in refresh.pages}

def validate_source(value, *, sitemap=False):
    # Only canonical HTTPS URLs from the original publishing origin are fetched.
    # Reject URL/path ambiguity rather than converting remote identifiers into paths.
    if not isinstance(value, str) or any(ord(c) <= 32 for c in value):
        raise ValueError('Invalid source URL')
    parsed = urlsplit(value)
    if (parsed.scheme != 'https' or parsed.netloc.lower() != 'teramis.us'
            or parsed.query or parsed.fragment):
        raise ValueError('Unapproved source URL: ' + value)
    if sitemap:
        valid_path = parsed.path == '/sitemap.xml'
    else:
        valid_path = re.fullmatch(r'/teramis-blog/(?:[a-z0-9][a-z0-9-]*/)*[a-z0-9][a-z0-9-]*/?', parsed.path)
    if not valid_path:
        raise ValueError('Unapproved source path: ' + value)
    return 'https://teramis.us' + parsed.path

class SourceRedirects(urllib.request.HTTPRedirectHandler):
    def __init__(self, *, sitemap=False):
        super().__init__()
        self.sitemap = sitemap

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        target = validate_source(newurl, sitemap=self.sitemap)
        return super().redirect_request(req, fp, code, msg, headers, target)

def get(value, *, sitemap=False):
    value = validate_source(value, sitemap=sitemap)
    opener = urllib.request.build_opener(SourceRedirects(sitemap=sitemap))
    with opener.open(urllib.request.Request(value, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
        validate_source(response.geturl(), sitemap=sitemap)
        return response.read()

def cache_path(source, cache_root=CACHE):
    source = validate_source(source)
    root = cache_root.resolve()
    target = (root / (hashlib.sha256(source.encode('utf-8')).hexdigest() + '.html')).resolve()
    if not target.is_relative_to(root):
        raise ValueError('Article cache destination escapes cache root')
    return target

def sitemap_articles(raw):
    sitemap = ET.fromstring(raw)
    sources = set()
    for node in sitemap.findall('{*}url/{*}loc'):
        value = node.text or ''
        if '/teramis-blog/' in value:
            sources.add(validate_source(value))
    return sorted(sources)
def url(value, source):
    value = urljoin(source, value)
    u = urlsplit(value)
    if u.scheme not in {'https', 'http', 'mailto'}: return None
    if u.hostname == 'teramis.us' and u.path in local_paths:
        return u.path + ('?'+u.query if u.query else '') + ('#'+u.fragment if u.fragment else '')
    return value if u.scheme != 'http' else None
def rich(n, source):
    out = ''
    for c in n.children:
        if isinstance(c, str): out += html.escape(c)
        elif c.tag in {'script','style','iframe','form','button'}: continue
        elif c.tag == 'a':
            href = url(c.attrs.get('href',''), source)
            out += '<a href="'+html.escape(href, quote=True)+'">'+rich(c,source)+'</a>' if href else rich(c,source)
        elif c.tag in {'strong','em','b','i'}: out += '<'+c.tag+'>'+rich(c,source)+'</'+c.tag+'>'
        elif c.tag == 'br': out += '<br />'
        else: out += rich(c,source)
    return out.strip()
def migrate(source):
    source = validate_source(source)
    path = urlsplit(source).path
    cache = cache_path(source)
    if not cache.exists(): cache.write_bytes(get(source))
    raw = cache.read_text(encoding='utf-8')
    parser=Parser(); parser.feed(raw)
    nodes=list(parser.root.all())
    body=next(n for n in nodes if n.attrs.get('id')=='hs_cos_wrapper_post_body')
    schema={}
    for n in nodes:
        if n.tag=='script' and n.attrs.get('type')=='application/ld+json':
            try:
                data=json.loads(''.join(c for c in n.children if isinstance(c,str)))
                if data.get('@type')=='BlogPosting': schema=data
            except (ValueError, AttributeError): pass
    title=schema.get('headline') or next(n.text() for n in nodes if n.tag=='h1')
    description=next((n.attrs.get('content','') for n in nodes if n.tag=='meta' and n.attrs.get('name')=='description'),'')
    image=next((n.attrs.get('content','') for n in nodes if n.tag=='meta' and n.attrs.get('property')=='og:image'),'')
    image_alt=next((n.attrs.get('content','') for n in nodes if n.tag=='meta' and n.attrs.get('property')=='og:image:alt'),title)
    blocks=[{'tag':'h1','text':title}]
    def walk(n):
        if n.tag in {'script','style','iframe','form','button'}: return
        if n.tag=='img':
            src=url(n.attrs.get('src',''),source)
            if src: blocks.append({'tag':'image','text':n.attrs.get('alt',''), 'src':src})
            return
        if n.tag=='table':
            rows=[[c.text() for c in row.all() if c.tag in {'td','th'}] for row in n.all() if row.tag=='tr']
            if rows: blocks.append({'tag':'table','text':'Article comparison','rows':rows, 'header':any(c.tag=='th' for c in n.all())})
            return
        if n.tag=='blockquote':
            blocks.append({'tag':'quote','text':n.text(), 'html':rich(n,source)}); return
        if n.tag in {'h1','h2','h3','h4','h5','h6','p','li'}:
            text=n.text()
            if text:
                tag='h2' if n.tag=='h1' else 'h3' if n.tag in {'h4','h5','h6'} else n.tag
                b={'tag':tag,'text':text}
                if tag in {'p','li'}: b['html']=rich(n,source)
                blocks.append(b)
            for c in n.all():
                if c is not n and c.tag=='img': walk(c)
            return
        for c in n.children:
            if isinstance(c,Node): walk(c)
    walk(body)
    if len(blocks)==1:
        for paragraph in re.split(r'(?:<br\s*/>\s*){2,}',rich(body,source)):
            text=html.unescape(re.sub(r'<[^>]+>',' ',paragraph)).strip()
            if text: blocks.append({'tag':'p','text':text,'html':paragraph})
    # Editorial summaries correct misplaced source metadata without changing article copy.
    if path.endswith('/is-itar-data-covered-defense-information'):
        description='Explore the differences and overlap between ITAR data, CUI, and Covered Defense Information in defense contracting.'
    elif path.endswith('/teramis-advanced-cui-identification-and-remediation-software'):
        description='Explore why manual review breaks down across enterprise repositories and how purpose-built CUI discovery supports validation at scale.'
    elif path.endswith('/cui-misclassification-risks-for-defense-contractors'):
        description=next((b['text'] for b in blocks if b['tag']=='p'),description)
    if len(blocks)<2: raise ValueError('Empty article: '+source)
    text=' '.join(b['text'] for b in blocks)
    category='Company & partners' if any(w in path for w in ['partnership', 'partners-with', '-partner-to-', 'cape-endeavors']) else 'Customer stories' if 'johnson-controls' in path else 'CUI discovery'
    if category=='CUI discovery':
        if 'spillage' in path or 'lifecycle' in path: category='Monitoring & remediation'
        elif any(w in path for w in ['cmmc','dfars','compliance','itar']): category='Compliance & scoping'
    return {'slug':path.strip('/').split('/'), 'path':path, 'title':title, 'description':description or text[0:170], 'source':source, 'parts':blocks, 'form':False, 'kind':'article', 'author':schema.get('author',{}).get('name','Teramis'), 'published':schema.get('datePublished',''), 'modified':schema.get('dateModified',''), 'image':image, 'imageAlt':image_alt, 'category':category, 'readMinutes':max(1,round(len(text.split())/220))}

if __name__=='__main__':
    urls = sitemap_articles(get('https://teramis.us/sitemap.xml', sitemap=True))
    local_paths.update(urlsplit(u).path for u in urls)
    CACHE.mkdir(parents=True, exist_ok=True)
    articles=list(ThreadPoolExecutor(max_workers=4).map(migrate,urls))
    articles.sort(key=lambda a:a['published'],reverse=True)
    (ROOT/'content/articles.json').write_text(json.dumps(articles,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for a in articles: print(a['path'],len(a['parts']),'blocks')
    print('Imported',len(articles),'complete articles.')
