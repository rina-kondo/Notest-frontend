// Note: (https://github.com/nextui-org/nextui/issues/1403)
"use client";

import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { axiosApi } from "@/lib/axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@nextui-org/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Chip } from "@nextui-org/chip";
import { Input, Textarea } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { useDisclosure } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Tooltip } from "@nextui-org/tooltip";
import { SearchIcon } from "@nextui-org/shared-icons";
import { BiLockAlt, BiLockOpenAlt, BiTrash, BiCopy } from "react-icons/bi";
import styles from "./page.module.scss";

type NoteForm = {
  body: string;
  is_saved: boolean;
};

type Validation = {
  body?: string;
};

type Note = {
  id: number;
  body: string;
  is_deleted: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
};

type PostButtonProps = {
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
};

export default function App() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editedNotes, setEditedNotes] = useState<{ [key: number]: string }>({});
  const [searchText, setSearchText] = useState("");
  const { checkLoggedIn } = useAuth();

  // get notes
  useEffect(() => {
    const init = async () => {
      const res: boolean = await checkLoggedIn();
      axiosApi
        .get("/api/notes")
        .then((response: AxiosResponse) => {
          console.log(response.data);
          setNotes(response.data.data);
        })
        .catch((err: AxiosError) => console.log(err.response));
    };
    init();
  }, []);

  function getSearch(searchText: string) {
    if (searchText.trim() === "") {
      axiosApi
        .get("/api/notes")
        .then((response: AxiosResponse) => {
          console.log(response.data);
          setNotes(response.data.data);
        })
        .catch((err: AxiosError) => {
          console.log(err.response);
        });
    } else {
      axiosApi
        .get(`/api/notes/search/${searchText}`)
        .then((response: AxiosResponse) => {
          console.log(response.data);
          setNotes(response.data.data);
        })
        .catch((err: AxiosError) => {
          console.log(err.response);
        });
    }
  }
  function toggleSaveSetting(id: number) {
    axiosApi
      .put(`api/notes/save/${id}`, id)
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === id ? { ...note, is_saved: !note.is_saved } : note
          )
        );
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        if (err.response?.status === 422) {
          const errors = (err.response?.data as any).errors;
        }
        if (err.response?.status === 500) {
          alert("システムエラーです");
        }
      });
  }

  function deleteNote(id: number) {
    axiosApi
      .delete(`api/notes/${id}`)
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        if (err.response?.status === 422) {
          const errors = (err.response?.data as any).errors;
        }
        if (err.response?.status === 500) {
          alert("システムエラーです");
        }
      });
  }

  const updateNote = (id: number, updatedBody: string) => {
    console.log(updatedBody);
    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .put(`/api/notes/${id}`, { body: updatedBody })
        .then((response: AxiosResponse) => {
          console.log(response.data);
          const updatedNoteFromAPI = response.data.note;
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === id ? updatedNoteFromAPI : note
            )
          );
        })
        .catch((err: AxiosError) => {
          console.log(err.response);
          if (err.response?.status === 422) {
            const errors = (err.response?.data as any).errors;
          }
          if (err.response?.status === 500) {
            alert("システムエラーです");
          }
        });
    });
  };

  // バウンス処理
  const debouncedUpdateNote = useDebounce(updateNote, 300);
  const debouncedHandleSearch = useDebounce(getSearch, 300);

  const handleInputChange = (id: number, value: string) => {
    setEditedNotes({ ...editedNotes, [id]: value });

    if (value.trim() !== "") {
      debouncedUpdateNote(id, value);
    }
  };

  const handleSearchTextChange = (value: string) => {
    setSearchText(value);
    debouncedHandleSearch(value);
  };

  return (
    <div className={styles.memo}>
      <div className={styles.headline}>
        <Input
          isClearable
          className={styles.search}
          placeholder="メモを検索"
          startContent={<SearchIcon />}
          value={searchText}
          onChange={(e) => handleSearchTextChange(e.target.value)}
          onClear={() => {
            setSearchText("");
            handleSearchTextChange("");
          }}
        />
        <PostButton setNotes={setNotes} />
      </div>
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>MEMO</TableColumn>
          <TableColumn width="160px">STATUS</TableColumn>
          <TableColumn width="90px">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"メモはありません"}>
          {notes.map((note: Note) => {
            return (
              <TableRow key={note.id}>
                <TableCell>
                  <input
                    className={styles.input}
                    value={
                      editedNotes[note.id] !== undefined
                        ? editedNotes[note.id]
                        : note.body
                    }
                    onChange={(e) => handleInputChange(note.id, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    color={note.is_saved ? "success" : "warning"}
                    variant="flat"
                  >
                    {note.is_saved ? "保存済み" : remainingDays(note)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    {note.is_saved ? (
                      <Tooltip content="保存を解除" placement="top">
                        <BiLockOpenAlt
                          className={`text-warning cursor-pointer active:opacity-50 ${styles.icon}`}
                          onClick={() => toggleSaveSetting(note.id)}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip content="保存する" placement="top">
                        <span>
                          <BiLockAlt
                            className={`text-success  cursor-pointer active:opacity-50 ${styles.icon}`}
                            onClick={() => toggleSaveSetting(note.id)}
                          />
                        </span>
                      </Tooltip>
                    )}
                    <Tooltip
                      color="danger"
                      content="メモを削除"
                      placement="top"
                    >
                      <span>
                        <BiTrash
                          className={`text-danger cursor-pointer active:opacity-50 ${styles.icon}`}
                          onClick={() => deleteNote(note.id)}
                        />
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const PostButton: React.FC<PostButtonProps> = ({ setNotes }) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [noteForm, setNoteForm] = useState<NoteForm>({
    body: "",
    is_saved: false,
  });
  const [validation, setValidation] = useState<Validation>({});

  const handleTextboxChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNoteForm({ ...noteForm, [e.target.name]: e.target.value });
    console.log(noteForm);
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNoteForm({ ...noteForm, is_saved: e.target.checked });
  };

  const createMemo = () => {
    setValidation({});

    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      console.log(noteForm);
      axiosApi
        .post("/api/notes", noteForm)
        .then((response: AxiosResponse) => {
          console.log(response.data);
          const newNote = response.data.note;
          setNotes((prevNotes) => [...prevNotes, newNote]);
          setNoteForm({
            body: "",
            is_saved: false,
          });
          onClose();
        })
        .catch((err: AxiosError) => {
          console.log(err.response);
          if (err.response?.status === 422) {
            const errors = (err.response?.data as any).errors;
            const validationMessages: { [index: string]: string } =
              {} as Validation;
            Object.keys(errors).map((key: string) => {
              validationMessages[key] = errors[key][0];
            });
            console.log(validationMessages);
            setValidation(validationMessages);
          }
          if (err.response?.status === 500) {
            alert("システムエラーです");
          }
        });
    });
  };

  return (
    <>
      <Button onPress={onOpen} variant="ghost" radius="sm">
        メモを追加する
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                メモの追加
              </ModalHeader>
              <ModalBody>
                <Textarea
                  autoFocus
                  labelPlacement="outside"
                  placeholder="メモを記載"
                  className="max-w-xl"
                  size="lg"
                  variant="flat"
                  name="body"
                  value={noteForm.body}
                  onChange={handleTextboxChange}
                />
                {validation.body && <p className="">{validation.body}</p>}
                <div className="flex py-2 px-1 justify-between">
                  <Checkbox
                    classNames={{
                      label: "text-small",
                    }}
                    color="success"
                    isSelected={noteForm.is_saved}
                    onChange={handleCheckboxChange}
                  >
                    自動非表示を無効にする
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="ghost"
                  radius="sm"
                  onPress={onClose}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  variant="ghost"
                  radius="sm"
                  endContent={validation.body}
                  onClick={createMemo}
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

// デバウンス処理
function useDebounce(callback: Function, delay: number) {
  const debounceTimeout = useRef<any>(null);

  return (...args: any[]) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

// 保存期限の残り日数を表示する
// 1日以下の場合は、残り時間を表示する
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

const remainingDays = (note: Note) => {
  const today = dayjs();
  const expirationDate = new Date(note.updated_at);
  const displayDuration = 3;
  expirationDate.setDate(expirationDate.getDate() + displayDuration);
  const remainingDays = Math.floor(
    (expirationDate.getTime() - today.valueOf()) / 86400000
  );
  const remainingHours = Math.floor(
    ((expirationDate.getTime() - today.valueOf()) % 86400000) / 3600000
  );
  if (remainingDays > 0) {
    return `${remainingDays}日後に非表示`;
  } else if (remainingDays === 0) {
    return `${remainingHours}時間後に非表示`;
  } else {
    return "期限切れ";
  }
};
