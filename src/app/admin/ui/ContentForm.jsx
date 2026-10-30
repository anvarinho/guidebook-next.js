'use client';

import { useActionState, useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import useUnsavedChanges from './useUnsavedChanges';
import { saveContent,previewContent } from '../lib/actions';

export default function ContentForm({ kind, url, locale, fields, paragraphs }) {
  const [values,setValues]=useState(fields);
  const [sections, setSections] = useState(paragraphs);
  const [state, action, pending] = useActionState(saveContent, { ok: false, message: '' });

  const form=useRef(null);
  const {dirty,markDirty}=useUnsavedChanges(form,state);
  const [preview,setPreview]=useState(null);
  const [previewPending,startPreview]=useTransition();
  function showPreview() {
    const values=new FormData(form.current);
    const text=kind==='articles'?(sections || []).map(section=>'## '+section.title+'\n\n'+section.text).join('\n\n'):String(values.get('description') || '');
    const request=new FormData();request.set('text',text);request.set('locale',locale);
    startPreview(async()=>{
      try {setPreview(await previewContent(request));}
      catch {setPreview({ok:false,message:'Preview unavailable. Please try again.',html:''});}
    });
  }
  function updateParagraph(index, key, value) {
    markDirty();
    setSections(current => current.map((item, position) =>
      position === index ? { ...item, [key]: value } : item,
    ));
  }

  return (
    <form ref={form} onChange={markDirty} action={action} className="panel editor-panel" aria-busy={pending}>
      <div className="form-section"><p className="eyebrow">The story, carefully told</p><h2>Edit {locale.toUpperCase()} content</h2><p className="muted">Save your edits when the details are ready. Preview the body without publishing changes.</p></div>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="url" value={url} />
      <input type="hidden" name="locale" value={locale} />
      <div className="form-grid">
        {Object.keys(fields).map(key => (
          <label htmlFor={'content-' + key} className={['description', 'keywords'].includes(key) ? 'full' : ''} key={key}>
            {key[0].toUpperCase() + key.slice(1)}
            {['description', 'keywords'].includes(key) ? (
              <textarea id={'content-' + key} name={key} rows={key === 'description' ? 14 : 3}
                maxLength={key === 'description' ? 200000 : 5000} value={values[key]} onChange={event=>setValues(current=>({...current,[key]:event.target.value}))} />
            ) : (
              <input id={'content-' + key} name={key} required={key === 'title' || key === 'name'}
                maxLength={key === 'subtitle' ? 3000 : 1000} value={values[key]} onChange={event=>setValues(current=>({...current,[key]:event.target.value}))} />
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
      {preview && <section className="content-preview" aria-label="Content preview"><div className="preview-heading"><h2>Body preview</h2><button type="button" onClick={()=>setPreview(null)}>Close preview</button></div><div className="preview-body">{preview.ok?<><p className="muted small">Preview reflects your last preview request. It does not save your changes.</p><div dangerouslySetInnerHTML={{__html:preview.html}}/></>:<p role="alert">{preview.message}</p>}</div></section>}
      <div className="editor-action-bar">
        <button className="primary" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
        <button type="button" disabled={previewPending || pending} onClick={showPreview}>{previewPending?'Preparing…':preview?'Refresh preview':'Preview body'}</button>
        <Link href={'/admin/' + kind}>Back to {kind}</Link>
        <span className="save-state" aria-live="polite">{dirty?'Unsaved changes':'No unsaved changes'}</span>
      </div>
    </form>
  );
}
