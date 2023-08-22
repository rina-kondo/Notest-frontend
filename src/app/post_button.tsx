"use client";

import { ChangeEvent, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { Textarea } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { useDisclosure } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { axiosApi } from "../lib/axios";

type NoteForm = {
  body: string;
  is_saved: boolean;
};

type Validation = {
  body?: string;
};

export default function PostButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
    console.log(noteForm);
  };

  const createMemo = () => {
    setValidation({});

    axiosApi.get("/sanctum/csrf-cookie").then((res) => {
      axiosApi
        .post("/api/notes", noteForm)
        .then((response: AxiosResponse) => {
          console.log(response.data);
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
                    color="default"
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
}
