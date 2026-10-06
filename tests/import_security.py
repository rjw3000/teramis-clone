"""Offline regressions for the manual importer's network/filesystem boundary."""
import importlib.util
import json
from pathlib import Path, PureWindowsPath
import re
import unittest
from unittest.mock import patch, MagicMock
from urllib.request import Request

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('article_import', ROOT / 'scripts/import-articles.py')
importer = importlib.util.module_from_spec(spec)
with patch('urllib.request.build_opener', side_effect=AssertionError('Network during module import')):
    spec.loader.exec_module(importer)

SAFE = 'https://teramis.us/teramis-blog/is-itar-data-covered-defense-information'
UNSAFE = [
    'https://attacker.invalid/teramis-blog/..\\..\\public\\import-proof',
    'https://teramis.us/teramis-blog/..\\..\\public\\import-proof',
    'https://teramis.us/teramis-blog/%2e%2e%5c%2e%2e%5cpublic%5cimport-proof',
    'https://teramis.us/teramis-blog/%252e%252e%255cpublic',
    'https://teramis.us/teramis-blog/../../public/import-proof',
    'https://teramis.us/teramis-blog/../import-proof',
    'https://teramis.us/teramis-blog/%00',
    'http://teramis.us/teramis-blog/article',
    'https://teramis.us.attacker.invalid/teramis-blog/article',
    'https://user@teramis.us/teramis-blog/article',
    'https://teramis.us:443/teramis-blog/article',
    'https://127.0.0.1/teramis-blog/article',
    SAFE + '?redirect=https://attacker.invalid',
    SAFE + '#fragment',
    SAFE + '\n',
    ' ' + SAFE,
]

class ImportSecurity(unittest.TestCase):
    def test_existing_articles_have_distinct_contained_hash_cache_names(self):
        articles = json.loads((ROOT / 'content/articles.json').read_text(encoding='utf-8'))
        names = set()
        for article in articles:
            self.assertEqual(importer.validate_source(article['source']), article['source'])
            cache = importer.cache_path(article['source'])
            self.assertEqual(cache.parent, importer.CACHE.resolve())
            self.assertTrue(re.fullmatch(r'[a-f0-9]{64}\.html', cache.name))
            # The generated name has identical safe leaf semantics on Windows and POSIX.
            self.assertEqual(PureWindowsPath(cache.name).name, cache.name)
            names.add(cache.name)
        self.assertEqual(len(names), len(articles))

    def test_hostile_sources_cannot_reach_fetch_or_cache_write(self):
        with patch.object(importer, 'get') as fetch:
            for source in UNSAFE:
                with self.subTest(source=source), self.assertRaises(ValueError):
                    importer.migrate(source)
            fetch.assert_not_called()

    def test_sitemap_rejects_an_attacker_loc_instead_of_importing_it(self):
        self.assertEqual(importer.sitemap_articles('<urlset><url><loc>' + SAFE + '</loc></url></urlset>'), [SAFE])
        for source in UNSAFE:
            xml = '<urlset><url><loc>' + source + '</loc></url></urlset>'
            with self.subTest(source=source), self.assertRaises(ValueError):
                importer.sitemap_articles(xml)

    def test_redirects_validate_destinations_before_following(self):
        redirect = importer.SourceRedirects()
        for code in [301, 302, 303, 307, 308]:
            req = redirect.redirect_request(Request(SAFE), None, code, 'redirect', {}, SAFE + '-updated')
            self.assertEqual(req.full_url, SAFE + '-updated')
            for source in UNSAFE:
                with self.subTest(code=code, source=source), self.assertRaises(ValueError):
                    redirect.redirect_request(Request(SAFE), None, code, 'redirect', {}, source)
        sitemap = importer.SourceRedirects(sitemap=True)
        with self.assertRaises(ValueError):
            sitemap.redirect_request(Request('https://teramis.us/sitemap.xml'), None, 302, 'redirect', {}, SAFE)

    def test_invalid_initial_request_and_final_response_are_not_read(self):
        with patch('urllib.request.build_opener') as build:
            with self.assertRaises(ValueError):
                importer.get(UNSAFE[0])
            build.assert_not_called()
        response = MagicMock()
        response.__enter__.return_value = response
        response.geturl.return_value = 'https://attacker.invalid/teramis-blog/article'
        opener = MagicMock()
        opener.open.return_value = response
        with patch('urllib.request.build_opener', return_value=opener):
            with self.assertRaises(ValueError):
                importer.get(SAFE)
            response.read.assert_not_called()

if __name__ == '__main__':
    unittest.main()
