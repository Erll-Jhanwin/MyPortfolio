import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound(){return <section className="page-body"><div className="container empty-state" style={{maxWidth:720,margin:"35px auto"}}><p className="eyebrow">404 · Not found</p><h1>This page isn’t here.</h1><p>The page may have moved, or this project has not been published. Try the project index or return home.</p><Link className="text-link" href="/"><ArrowLeft size={15}/> Back to home</Link></div></section>}
