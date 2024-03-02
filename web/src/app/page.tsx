"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}

export function Main() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (query) => {
      const res = await fetch("/api/fetch");
      const data = await res.json();
      return data as {
        id: number;
        name: string;
        judgement_json: {
          criteria: {
            name: string;
            rating: number;
          }[];
          review: string;
        };
      }[];
    },

    refetchInterval: 500,
  });

  return (
    <main className="flex min-h-screen flex-col items-center gap-36 p-24 w-full ">
      <div className=" flex flex-col items-center gap-10">
        <h1 className="text-2xl md:text-6xl font-bold ">Judgement Day</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/one.webp" alt="Judge" width={200} height={200} />
        <h2 className="text-lg md:text-2xl font-semibold">
          <u>One</u> is today{"'"}s judge
        </h2>
      </div>
      {data && data.length > 0 && (
        <div className="flex flex-col gap-4 items-center w-full">
          <ul className="flex flex-col gap-4">
            {data.map((user) => (
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
