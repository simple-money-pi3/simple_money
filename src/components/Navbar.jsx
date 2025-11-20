export default function Navbar() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <h1 className="font-semibold text-violet-700">SimpleMoney</h1>
        <nav className="text-sm text-zinc-600 flex gap-4">
          <a href="/">Dashboard</a>
          <a href="/goals">Metas</a>
          <a href="/transactions">Transações</a>
          <a href="/challenges">Desafios</a>
          <a href="/profile">Perfil</a>
        </nav>
      </div>
    </header>
  );
}
