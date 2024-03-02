"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState<
    {
      id: number;
      name: string;
      judgement_json: {
        criteria: {
          name: string;
          rating: number;
        }[];
        review: string;
      };
    }[]
  >([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/fetch");
    const data = await res.json();
    console.log("data", data);
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {users.length}
      {users.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">Users</h1>
          <ul className="flex flex-col gap-4">
            {users.map((user) => (
              <li key={user.id} className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-sm opacity-50">
                  {user.judgement_json.review}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
