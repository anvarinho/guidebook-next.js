import test from 'node:test';
import assert from 'node:assert/strict';
import {articleImageAlt} from '../src/lib/articleImageAlt';
import {i18n} from '../src/lib/i18n.config';
import media from '../src/lib/generated/article-media.json';

test('published article artwork has a nonempty description in every supported language',()=>{
  for(const [image,translations] of Object.entries(media)){
    assert.deepEqual(Object.keys(translations).sort(),[...i18n.locales].sort());
    for(const locale of i18n.locales){
      assert.ok(articleImageAlt(image,locale,'').trim());
      assert.equal(articleImageAlt('/'+image,locale,''),articleImageAlt(image,locale,''));
    }
  }
});

test('existing article images retain their original fallback description',()=>{
  assert.equal(articleImageAlt('uploads/son-kol.jpg','en','Son-Kul Lake'),'Son-Kul Lake');
  assert.equal(articleImageAlt('uploads/other-article.webp','kg','Мурунку сүрөт'),'Мурунку сүрөт');
});
