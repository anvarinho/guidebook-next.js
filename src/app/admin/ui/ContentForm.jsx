'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { saveContent } from '../lib/actions';

export default function ContentForm({ kind, url, locale, fields, paragraphs }) {
  const [sections, setSections] = useState(paragraphs);
  const [state, action, pending] = useActionState(saveContent, { ok: false, message: '' });

  function updateParagraph(index, key, value) {
    setSections(current => current.map((item, position) =>
      position === index ? { ...item, [key]: value } : item,
    ));
  }

  return (
    <form action={action} className="panel" aria-busy={pending}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="url" value={url} />
      <input type="hidden" name="locale" value={locale} />
      <div className="form-grid">
        {Object.entries(fields).map(([key, value]) => (
          <label htmlFor={'content-' + key} className={['description', 'keywords'].includes(key) ? 'full' : ''} key={key}>
            {key[0].toUpperCase() + key.slice(1)}
            {['description', 'keywords'].includes(key) ? (
              <textarea id={'content-' + key} name={key} rows={key === 'description' ? 14 : 3}
                maxLength={key === 'description' ? 200000 : 5000} defaultValue={value} />
            ) : (
              <input id={'content-' + key} name={key} required={key === 'title' || key === 'name'}
                maxLength={key === 'subtitle' ? 3000 : 1000} defaultValue={value} />
            )}
          </label>
        ))}
      </div>
      {sections && (
        <section style={{ marginTop: 24 }}>
          <h2>Article paragraphs</h2>
          <input type="hidden" name="paragraphs" value={JSON.stringify(sections)} />
          {sections.map((paragraph, index) => (
            <fieldset key={index} className="panel">
              <legend>Paragraph {index + 1}</legend>
              <label htmlFor={'paragraph-heading-' + index}>
                Heading
                <input id={'paragraph-heading-' + index} maxLength={1000} value={paragraph.title}
                  onChange={event => updateParagraph(index, 'title', event.target.value)} />
              </label>
              <label htmlFor={'paragraph-text-' + index}>
                Text
                <textarea id={'paragraph-text-' + index} rows={8} maxLength={200000} value={paragraph.text}
                  onChange={event => updateParagraph(index, 'text', event.target.value)} />
              </label>
            </fieldset>
          ))}
        </section>
      )}
      {state.message && (
        <div role={state.ok ? 'status' : 'alert'} className={'notice' + (state.ok ? '' : ' error')}>
          {state.message}
        </div>
      )}
      <div className="form-actions">
        <button className="primary" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
        <Link href={'/admin/' + kind}>Back to {kind}</Link>
      </div>
    </form>
  );
}
