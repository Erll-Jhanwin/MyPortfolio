"use client";
import { useEffect } from "react";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{console.error("page_render_failed",{code:"render_error"})},[]);return <section className="page-body"><div className="container empty-state" style={{maxWidth:720,margin:"35px auto"}}><p className="eyebrow">Something went wrong</p><h1>This page couldn’t load.</h1><p>Please try again. If the problem continues, return to the home page.</p><button className="button button-dark" onClick={()=>reset()}>Try again</button></div></section>}
