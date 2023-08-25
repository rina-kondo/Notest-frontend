// Note: (https://github.com/nextui-org/nextui/issues/1403)
"use client";

import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, ChangeEvent, useMemo } from "react";
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
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Chip } from "@nextui-org/chip";
import { Input, Textarea } from "@nextui-org/input";
import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { useDisclosure } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Tooltip } from "@nextui-org/tooltip";
import { SearchIcon, ChevronDownIcon } from "@nextui-org/shared-icons";
import { BiLockAlt, BiLockOpenAlt, BiTrash, BiCopy } from "react-icons/bi";
import styles from "./page.module.scss";
import { on } from "events";

type NoteForm = {
  body: string;
  note_group_id?: number;
  is_saved: boolean;
};

type Validation = {
  body?: string;
};

type NoteGroup = {
  id: number;
  user_id: number;
  title: string;
  save_duration: number;
  notes: Note[];
  updated_at: string;
  created_at: string;
};

type Note = {
  id: number;
  note_group_id: number;
  body: string;
  is_deleted: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
};

type PostButtonProps = {
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setNoteGroups: React.Dispatch<React.SetStateAction<NoteGroup[]>>;
  noteGroup: NoteGroup;
};

export default function App() {
  const router = useRouter();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [noteGroups, setNoteGroups] = useState<NoteGroup[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editedNotes, setEditedNotes] = useState<{ [key: number]: string }>({});
  const [searchText, setSearchText] = useState("");
  const { checkLoggedIn } = useAuth();

  const fetchNoteGroups = async () => {
    try {
      const response = await axiosApi.get("/api/note-groups");
      console.log("done");
      console.log(response.data);
      return response.data.data;
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    const init = async () => {
      const fetchedNoteGroups = await fetchNoteGroups();
      setNoteGroups(fetchedNoteGroups);
    };
    init();
  }, []);

  function createMemoGroup() {
    axiosApi
      .post("/api/note-groups")
      .then((response: AxiosResponse) => {
        console.log(response.data);
        fetchNoteGroups();
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
      });
  }

  function getSearch(searchText: string) {
    if (searchText.trim() === "") {
      axiosApi
        .get("/api/note-groups")
        .then((response: AxiosResponse) => {
          setNoteGroups(response.data.data);
        })
        .catch((err: AxiosError) => {
          console.log(err.response);
        });
    } else {
      axiosApi
        .get(`/api/note-groups/search/${searchText}`, {
          params: { query: searchText },
        })
        .then((response: AxiosResponse) => {
          console.log(response.data);
          setNoteGroups(response.data.data);
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
        setNoteGroups((prevNoteGroups) =>
          prevNoteGroups.map((noteGroup) => ({
            ...noteGroup,
            notes: noteGroup.notes.map((note) =>
              note.id === id ? { ...note, is_saved: !note.is_saved } : note
            ),
          }))
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
        setNoteGroups((prevNoteGroups) =>
          prevNoteGroups.map((noteGroup) => ({
            ...noteGroup,
            notes: noteGroup.notes.filter((note) => note.id !== id),
          }))
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

  const updateNote = (id: number, updatedBody: string) => {
    console.log(updatedBody);
    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .put(`/api/notes/${id}`, { body: updatedBody })
        .then((response: AxiosResponse) => {
          const updatedNoteFromAPI = response.data.note;
          setNoteGroups((prevNoteGroups) =>
            prevNoteGroups.map((noteGroup) => ({
              ...noteGroup,
              notes: noteGroup.notes.map((note) =>
                note.id === id ? updatedNoteFromAPI : note
              ),
            }))
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

  const handleSearchTextChange = (
    value: string | null,
    noteGroup: NoteGroup
  ) => {
    const searchTextValue = value || "";
    console.log(searchTextValue);
    setSearchText(searchTextValue);
    debouncedHandleSearch(searchTextValue, noteGroup);
  };

  // ステータスのフィルタリング(未実装)
  // const [visibleColumns, setVisibleColumns] = useState(new Set(["active"]));

  // visibleColumnsの状態が変わるたびに、noteGroupsを更新する
  // useEffect(() => {
  //   console.log(visibleColumns);
  //   const filteredNoteGroups = noteGroups.map((noteGroup) => {
  //     return {
  //       ...noteGroup,
  //       notes: noteGroup.notes.filter((note) => {
  //         if (visibleColumns.has("active")) {
  //           return note.is_saved === true;
  //         }
  //         if (visibleColumns.has("inactive")) {
  //           return note.is_saved === false;
  //         }
  //         return true;
  //       }),
  //     };
  //   });
  //   setNoteGroups(filteredNoteGroups);
  // }, [visibleColumns]);

  const [deleteGroupId, setDeleteGroupId] = useState<number[]>([]);

  const deleteNotes = () => {
    console.log(deleteGroupId);
    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .delete("/api/note-groups", {
          data: { ids: deleteGroupId },
        })
        .then((response: AxiosResponse) => {
          console.log(response.data);
          setNoteGroups((prevNoteGroups) =>
            prevNoteGroups.filter((noteGroup) => {
              return !deleteGroupId.includes(noteGroup.id);
            })
          );
          setDeleteGroupId([]);
          onClose();
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

  return (
    <>
      <Button
        className={styles.memogroupButton}
        size="md"
        variant="bordered"
        radius="sm"
        color="primary"
        onClick={() => createMemoGroup()}
      >
        メモグループを新規作成
      </Button>
      <Button
        className={styles.memogroupButton}
        size="md"
        variant="bordered"
        radius="sm"
        color="danger"
        onPress={onOpen}
      >
        メモグループの管理
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                メモグループの管理
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <CheckboxGroup
                  label="削除するメモグループを選択してください"
                  onValueChange={setDeleteGroupId}
                >
                  {noteGroups.map((noteGroup: NoteGroup) => (
                    <Checkbox
                      color="danger"
                      key={noteGroup.id}
                      value={noteGroup.id.toString()}
                    >
                      {noteGroup.title}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={deleteNotes}>
                  チェックしたメモグループを削除
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Input
        isClearable
        className={styles.search}
        placeholder="メモを検索"
        startContent={<SearchIcon />}
        value={searchText}
        onChange={(e) => handleSearchTextChange(e.target.value, noteGroups)}
        onClear={() => {
          setSearchText("");
          handleSearchTextChange("");
        }}
      />
      <div className={styles.memoList}>
        {noteGroups.map((noteGroup: NoteGroup) => (
          <div className={styles.memo} key={noteGroup.id}>
            <div className={styles.headline}>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    endContent={<ChevronDownIcon className="text-small" />}
                    variant="flat"
                    radius="sm"
                  >
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Selection hidden columns"
                  closeOnSelect={false}
                  selectionMode="multiple"
                  //未実装のため選択できないようにする
                  disabledKeys={["active", "inactive"]}
                  // selectedKeys={visibleColumns}
                  // onSelectionChange={setVisibleColumns}
                >
                  <DropdownItem key="active">保存済み/期限内</DropdownItem>
                  <DropdownItem key="inactive">期限切れ</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <PostButton
                noteGroup={noteGroup}
                setNotes={setNotes}
                setNoteGroups={setNoteGroups}
              />
            </div>
            <Table aria-label="Example static collection table">
              <TableHeader>
                <TableColumn>{noteGroup.title}</TableColumn>
                <TableColumn width="160px">STATUS</TableColumn>
                <TableColumn width="90px">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"メモはありません"}>
                {noteGroup.notes.map((note: Note) => {
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
                          onChange={(e) =>
                            handleInputChange(note.id, e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={
                            note.is_saved
                              ? "success"
                              : remainingDays(note) === "期限切れ"
                              ? "default"
                              : "warning"
                          }
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
        ))}
      </div>
    </>
  );
}

const PostButton: React.FC<PostButtonProps> = ({
  noteGroup,
  setNoteGroups,
}) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  type PostButtonProps = {
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    noteGroup: NoteGroup;
  };

  const [noteForm, setNoteForm] = useState<NoteForm>({
    body: "",
    is_saved: false,
    note_group_id: noteGroup.id,
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

          setNoteGroups((prevNoteGroups) =>
            prevNoteGroups.map((ng) => {
              if (ng.id === noteGroup.id) {
                return {
                  ...ng,
                  notes: [...ng.notes, newNote],
                };
              }
              return ng;
            })
          );
          noteForm.body = "";
          noteForm.is_saved = false;
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
