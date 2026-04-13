export default function PostPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <h1>post {params.id} — coming soon</h1>
    </main>
  )
}
