import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1 className="font-bold text-red-300 text-6xl text-center mb-8">
        ESMP !
      </h1>
      <nav className="border-gray-900 border p-4 rounded-lg shadow-lg bg-white">
        <ul className="flex justify-center space-x-4">
          <li>
            <Link
              className="border border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition duration-300"
              href="/player"
            >
              MP3 플레이어
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
