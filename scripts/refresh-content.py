"""Import complete public page content, retaining safe links and FAQ structure."""
import json, re, html, urllib.request
from html.parser import HTMLParser
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
class Node:
    def __init__(self, tag='', attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs or []), parent, []
    def text(self):
        return ' '.join(' '.join(c.text() if isinstance(c, Node) else c for c in self.children).split())
    def all(self):
        yield self
        for c in self.children:
            if isinstance(c, Node): yield from c.all()

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('document'); self.current = self.root
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.current); self.current.children.append(n)
        if tag not in {'img','input','br','hr','meta','link','source','wbr','area','embed'}: self.current = n
    def handle_endtag(self, tag):
        n = self.current
        while n.parent and n.tag != tag: n = n.parent
        if n.parent: self.current = n.parent
    def handle_data(self, data): self.current.children.append(data)

pages = json.loads((ROOT/'content/pages.json').read_text(encoding='utf-8'))
paths = {p['path'] for p in pages}
ALIASES = {
    '/platform/continuous-cui-monitoring': '/platform/ongoing-cui-monitoring',
    '/solutions/spillage-management': '/solutions/cui-remediation-spillage-monitoring',
    '/solutions/spillage-monitoring': '/solutions/cui-remediation-spillage-monitoring',
    '/solutions/by-organization/cmmc-advisory': '/solutions/by-organization/compliance-advisors',
    '/solutions/cmmc-advisory': '/solutions/by-organization/compliance-advisors',
    '/solutions/by-organization-enterprise': '/solutions/by-organization/enterprise',
    '/solutions/small-business': '/solutions/by-organization/small-business',
    '/solutions/cui-remediation': '/platform/remediation',
    '/solutions/supply-chain-ma-review': '/solutions/supply-chain-ma',
    '/contact2': '/contact-us', '/news': '/teramis-blog',
}
def link_url(url):
    if url.startswith('https://teramis.us/') or (url.startswith('/') and not url.startswith('//')):
        relative = url.removeprefix('https://teramis.us')
        path = relative.split('?')[0].split('#')[0] or '/'
        path = ALIASES.get(path, path)
        if path in paths: return path
        return 'https://teramis.us'+relative
    if url.startswith(('https://','mailto:','#')): return url
    return None
def rich(n):
    out = ''
    for c in n.children:
        if isinstance(c, str): out += html.escape(c)
        elif c.tag in {'script','style','form','iframe','button'}: continue
        elif c.tag == 'a':
            url = link_url(c.attrs.get('href',''))
            out += '<a href="'+html.escape(url, quote=True)+'">'+rich(c)+'</a>' if url else rich(c)
        elif c.tag in {'strong','em','b','i'}: out += '<'+c.tag+'>'+rich(c)+'</'+c.tag+'>'
        elif c.tag == 'br': out += '<br />'
        else: out += rich(c)
    return out.strip()

BAD = re.compile(r'digital marketing|previous draft|V2 approval document|no suggestions because|pending approval|Section B,', re.I)
def refresh(p):
    if p['path'] == '/brief': return p, 'kept'
    req = urllib.request.Request(p['source'], headers={'User-Agent':'Mozilla/5.0'})
    try:
        raw = urllib.request.urlopen(req, timeout=30).read().decode('utf-8')
        parser = Parser(); parser.feed(raw)
        main = next((n for n in parser.root.all() if n.tag=='main' or n.attrs.get('id')=='main-content'), None)
        if not main: return p, 'no main'
        parts=[]; first_h1=False; seen=set()
        def add(tag,n,**extra):
            nonlocal first_h1
            text=n.text()
            if not text or BAD.search(text) or text == 'Trusted by leading companies': return
            if tag=='h1':
                if first_h1: tag='h2'
                first_h1=True
            key=(tag,text,extra.get('href'))
            if key in seen: return
            seen.add(key)
            b={'tag':tag,'text':text,**extra}
            if tag in {'p','li'}: b['html']=rich(n)
            parts.append(b)
        def walk(n):
            if n.tag in {'script','style','form','iframe','nav'}: return
            if n.attrs.get('aria-hidden')=='true' or 'display:none' in n.attrs.get('style','').replace(' ',''): return
            if n.tag=='details':
                question=next((c for c in n.children if isinstance(c,Node) and c.tag=='summary'),None)
                answers=[c.text() for c in n.children if isinstance(c,Node) and c.tag!='summary']
                if question and answers: add('faq',question,answer=' '.join(answers))
                return
            # HubSpot FAQ modules use buttons and an adjacent answer panel.
            if n.tag=='button' and n.attrs.get('aria-expanded') is not None:
                if BAD.search(n.text()): return
                answer_id=n.attrs.get('aria-controls')
                answer=next((a for a in main.all() if a.attrs.get('id')==answer_id),None) if answer_id else None
                if not answer and n.parent:
                    answer=next((a for a in n.parent.children if isinstance(a,Node) and a is not n and a.text()),None)
                if answer and answer.text(): add('faq',n,answer=answer.text())
                return
            if n.tag in {'h1','h2','h3','h4','h5','h6','p','li'}:
                add('h3' if n.tag in {'h4','h5','h6'} else n.tag,n)
                return
            if n.tag=='a':
                url=link_url(n.attrs.get('href',''))
                if url: add('link',n,href=url)
                return
            for c in n.children:
                if isinstance(c,Node): walk(c)
        walk(main)
        if not parts: return p, 'empty main'
        if not any(b['tag']=='h1' for b in parts):
            parts.insert(0, {'tag':'h1','text': 'End User License Agreement' if p['path']=='/eula' else p['title'].split('|')[0].strip()})
        p={**p,'parts':parts}
        return p, str(len(parts))+' blocks'
    except Exception as e: return p, 'ERROR '+str(e)

if __name__=='__main__':
    results=list(ThreadPoolExecutor(max_workers=4).map(refresh,pages))
    for p,status in results: print(p['path'],status)
    (ROOT/'content/pages.json').write_text(json.dumps([p for p,_ in results],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
