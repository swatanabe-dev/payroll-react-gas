import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

function ModalProvider({ children }) {
  // modal = null || {type: string, payload?:any}
  const [modal, setModal] = useState(null);

  function openModal(type, payload = null) {
    setModal({ type, payload });
  }

  function closeModal() {
    setModal(null);
  }

  return (
    <ModalContext.Provider
      value={{
        modal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

function useModal() {
  const context = useContext(ModalContext);

  // Below accounts for the case where this contexts are used outside of the context provider scope.
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }

  return context;
}

/* eslint-disable */
export { ModalProvider, useModal };
