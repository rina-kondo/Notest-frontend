// Note: (https://github.com/nextui-org/nextui/issues/1403)
"use client";

import React, { use } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { axiosApi } from "@/lib/axios";
import { Button } from "@nextui-org/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import styles from "./page.module.scss";
import PostButton from "./post_button";

type Note = {
  id: number;
  body: string;
  is_deleted: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
};

export default function App() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    axiosApi
      .get("/api/notes")
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setNotes(response.data.data);
      })
      .catch((err: AxiosError) => console.log(err.response));
  }, []);

  return (
    <div className={styles.memo}>
      <PostButton />
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>MEMO</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"メモはありません"}>
          {notes.map((note: Note) => {
            return (
              <TableRow key={note.id}>
                <TableCell>{note.body}</TableCell>
                <TableCell>
                  {note.is_saved ? "保存済み" : remainingDays(note)}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" radius="sm">
                    編集
                  </Button>
                  <Button size="sm" variant="ghost" radius="sm">
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// 保存期限の残り日数を表示する
// 1日以下の場合は、残り時間を表示する
const remainingDays = (note: Note) => {
  const today = new Date();
  const expirationDate = new Date(note.updated_at);
  const displayDuration = 3;
  expirationDate.setDate(expirationDate.getDate() + displayDuration);
  const remainingDays = Math.floor(
    (expirationDate.getTime() - today.getTime()) / 86400000
  );
  const remainingHours = Math.floor(
    ((expirationDate.getTime() - today.getTime()) % 86400000) / 3600000
  );
  if (remainingDays > 0) {
    return `${remainingDays}日後に非表示`;
  } else if (remainingDays === 0) {
    return `${remainingHours}時間後に非表示`;
  } else {
    return "期限切れ";
  }
};
