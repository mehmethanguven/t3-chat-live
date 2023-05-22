import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import type { Message } from "../../constants/schemas";
import { trpc } from "../../utils/trpc";
import Head from "next/head";
import moment from "moment";
import Image from "next/image";

const RoomPage = () => {
  const router = useRouter();
  const { query } = router;
  const roomId = query.roomId as string;
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { mutateAsync: sendMessageMutation } =
    trpc.room.sendMessage.useMutation();
  trpc.room.onSendMessage.useSubscription(
    { roomId },
    {
      onData(message) {
        setMessages((messages) => {
          return [...messages, message];
        });
      },
    }
  );

  const exit = () => {
    router.push("/");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessageMutation({
      roomId,
      message,
    });
    setMessage("");
  };

  return (
    <>
      {console.log(JSON.stringify(session?.user))}
      <Head>
        <title>Live Chat | {roomId ? "Private Room" : "Public Room"}</title>
        <meta name="description" content="Just a live chat " />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session && (
        <div className="fixed top-0 right-0 left-0 flex justify-end bg-neutral-900 px-10 py-4 text-lg">
          <div className="mr-5 text-white">
            {session.user?.name || "Unknown"}
          </div>
          <button
            className="transition-color text-gray-400 underline duration-300 hover:text-white"
            onClick={exit}
          >
            Exit Chat Room
          </button>
        </div>
      )}
      <main className="flex min-h-screen flex-col bg-neutral-900">
        <div className="flex h-full w-full flex-1 flex-col justify-end overflow-y-auto border-b-2 border-cyan-500 px-4 pb-2">
          {messages.map((message, key) => {
            const isCurrentUser = message.sender.name === session?.user?.name;
            const messageClassName = "w-2/3 rounded-xl p-2";

            return (
              <div key={key} className="font-xl mb-3 flex items-end text-white">
                {!isCurrentUser && (
                  <div className="mr-4 h-10 w-10 rounded-full bg-white">
                    <Image
                      className="rounded-full"
                      src={session?.user?.image as string}
                      alt=""
                      width={40}
                      height={40}
                    />
                  </div>
                )}
                <div
                  className={
                    isCurrentUser
                      ? `ml-auto rounded-br-none bg-gradient-to-r from-cyan-500 to-blue-500 ${messageClassName}`
                      : `mr-auto rounded-bl-none bg-neutral-800 ${messageClassName}`
                  }
                >
                  <div>
                    {!isCurrentUser && (
                      <div className="font-bold">{message.sender.name}</div>
                    )}
                    <div className="text-lg text-white">{message.message}</div>
                  </div>
                  <div
                    className={
                      !isCurrentUser
                        ? "text-end text-sm text-neutral-400"
                        : "text-end text-sm text-white"
                    }
                  >
                    Sent {moment(message.sentAt).fromNow()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <form
          className="flex w-full items-center justify-center bg-neutral-800 px-3 pb-7 pt-4"
          onSubmit={handleSubmit}
        >
          <input
            placeholder="Aa"
            autoFocus={true}
            className="h-14 w-full resize-none rounded-full bg-neutral-700 py-2 px-5 text-lg text-white focus:ring-white"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
          <button
            className="ml-5 h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-2 font-semibold text-white"
            type="submit"
          >
            Send
          </button>
        </form>
      </main>
    </>
  );
};

export default RoomPage;
