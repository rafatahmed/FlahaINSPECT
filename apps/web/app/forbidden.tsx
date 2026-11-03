import Link from 'next/link';

export default function Forbidden() {
  return <main><h1>Access denied</h1><p>Your account cannot open this page.</p>
    <Link href="/">Return to my workspace</Link></main>;
}
