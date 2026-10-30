'use client';
import {useEffect,useRef,useState} from 'react';

export default function useUnsavedChanges(form, result) {
  const [dirty,setDirty]=useState(false);
  const dirtyRef=useRef(false);
  const markDirty=()=>{dirtyRef.current=true;setDirty(true);};
  useEffect(()=>{if(result.ok){dirtyRef.current=false;setDirty(false);}},[result]);
  useEffect(()=>{
    const ask=()=>{
      if(!dirtyRef.current) return true;
      if(!window.confirm('You have unsaved changes. Leave without saving?')) return false;
      dirtyRef.current=false;setDirty(false);return true;
    };
    const unload=event=>{if(dirtyRef.current){event.preventDefault();event.returnValue='';}};
    const click=event=>{
      const link=event.target.closest?.('a[href]');
      if(!link || link.target==='_blank' || link.hasAttribute('download') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button!==0) return;
      const destination=new URL(link.href,location.href);
      if(destination.pathname===location.pathname && destination.search===location.search) return;
      if(!ask()){event.preventDefault();event.stopPropagation();}
    };
    const submit=event=>{if(event.target!==form.current && !ask()){event.preventDefault();event.stopPropagation();}};
    window.addEventListener('beforeunload',unload);
    document.addEventListener('click',click,true);
    document.addEventListener('submit',submit,true);
    // The Navigation API additionally covers same-document history traversals in
    // supporting browsers; beforeunload remains the fallback for document exits.
    const navigation=window.navigation;
    const navigate=event=>{if(event.navigationType==='traverse' && event.cancelable && !event.hashChange && !ask())event.preventDefault();};
    navigation?.addEventListener('navigate',navigate);
    return()=>{
      window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);document.removeEventListener('submit',submit,true);
      navigation?.removeEventListener('navigate',navigate);
    };
  },[form]);
  return {dirty,markDirty};
}
