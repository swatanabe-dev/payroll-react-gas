import { createPortal } from "react-dom";

import { useModal } from "../contexts/ModalContext";
import "./Modal.css";

function Modal({ children }) {
  const { closeModal } = useModal();

  return createPortal(
    <div onClick={closeModal} className="modal">
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
}

export default Modal;
