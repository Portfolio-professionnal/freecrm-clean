export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Bienvenue sur FreeCRM</h1>
      <p className="text-xl mb-8">La solution de gestion pour freelances et micro-entrepreneurs</p>
      <div className="flex gap-4">
        <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Connexion
        </a>
        <a href="/signup" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300">
          Inscription
        </a>
      </div>
    </main>
  );
}
