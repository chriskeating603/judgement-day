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

function Main() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (query) => {
      const res = await fetch("/api/fetch", {
        cache: "no-store",
        method: "POST",
      });
      const data = await res.json();
      return data as {
        id: number;
        name: string;
        judgement_json: {
          image: string;
          criteria: {
            name: string;
            rating: number;
          }[];
          review: string;
        };
      }[];
    },

    refetchInterval: 2000,
  });

  const top3 = data
    ?.map((user) => user)
    ?.sort((a, b) => {
      const aTotal = a.judgement_json.criteria.reduce(
        (acc, criterion) => acc + criterion.rating,
        0
      );
      const bTotal = b.judgement_json.criteria.reduce(
        (acc, criterion) => acc + criterion.rating,
        0
      );
      return bTotal - aTotal;
    })
    .slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col items-center gap-20 py-24 w-full ">
      <div className=" flex flex-col items-center gap-10">
        <h1 className="text-2xl md:text-6xl font-bold p-5 border-b">
          Judgement Day
        </h1>
        <div className="flex flex-col items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="one.png"
            alt="Judge"
            width={200}
            height={200}
            className="rounded-xl"
          />
          <h2 className="text-lg md:text-2xl font-semibold">
            <u>One{"'"}s</u> Judgement
          </h2>
        </div>
        <div className="border p-5 rounded-lg shadow-sm mx-5 max-w-sm">
          <p className="font-semibold">
            One{"'"}s judgement is ruthless and final. Do not get on his bad
            side.
          </p>
          <br />

          {top3 && top3[0] && (
            <>
              <p>
                1st: 🤗 {top3[0]?.name} 🤗{" ("}
                {(
                  top3[0]?.judgement_json.criteria.reduce(
                    (acc, criterion) => acc + criterion.rating,
                    0
                  ) / top3[0]?.judgement_json.criteria.length
                ).toFixed(2)}
                {")"}
              </p>
              {top3[1] && (
                <p>
                  2nd: 😡 {top3[1]?.name} 😡
                  {" ("}
                  {(
                    top3[1]?.judgement_json.criteria.reduce(
                      (acc, criterion) => acc + criterion.rating,
                      0
                    ) / top3[1]?.judgement_json.criteria.length
                  ).toFixed(2)}
                  {")"}
                </p>
              )}
              {top3[2] && (
                <p>
                  3rd: 🤢 {top3[2]?.name} 🤢
                  {" ("}
                  {(
                    top3[2]?.judgement_json.criteria.reduce(
                      (acc, criterion) => acc + criterion.rating,
                      0
                    ) / top3[2]?.judgement_json.criteria.length
                  ).toFixed(2)}
                  {")"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center w-full px-10">
        {!(top3 && top3[0]) && (
          <p className="opacity-50 text-sm">
            waiting for the first judgement to come in...
          </p>
        )}
        {isLoading && (
          <p className="text-2xl font-semibold text-center w-full animate-pulse">
            Loading... this was built in a day... please wait lol
          </p>
        )}
        {data && data.length > 0 && (
          <ul className="flex flex-col gap-4 w-full max-w-3xl">
            {data.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-2 border w-full rounded-xl p-4 shadow-lg"
              >
                {/* {JSON.stringify(user)} */}
                <div className="flex flex-col items-center">
                  {user.judgement_json.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.judgement_json.image}
                      alt="User"
                      width={500}
                      height={500}
                    />
                  )}
                  <h2 className="font-semibold">{user.name}</h2>
                </div>
                {user.judgement_json.review && (
                  <>
                    <p className="text-sm opacity-60">
                      {'"'}
                      {user.judgement_json.review}
                      {'"'} -{" "}
                      <i className="text-sm opacity-60">One Chowdhury (2024)</i>
                    </p>
                    <ul className="flex flex-col">
                      {user.judgement_json.criteria.map((criterion) => (
                        <li key={criterion.name} className="flex gap-4">
                          <h3 className="font-semibold">{criterion.name}</h3>
                          <p>{criterion.rating}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
