import { Link } from 'wouter';

export function NotFoundPage() {
  return (
    <main className="not-found">
      <section>
        <p className="eyebrow">Last Lift</p>
        <h1>Page not found</h1>
        <p>
          <Link href="/">Back to the game</Link>
        </p>
      </section>
    </main>
  );
}
