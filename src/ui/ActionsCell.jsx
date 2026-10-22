import { edit, trash } from "../assets";
import IconButton from "./IconButton";

import "./ActionsCell.css";
function ActionsCell({ id, onEdit, onDelete }) {
  return (
    <div className="actions-cell">
      <IconButton title="Update" onClick={() => onEdit(id)}>
        <img src={edit} alt="edit" />
      </IconButton>

      <IconButton title="Delete" onClick={() => onDelete(id)}>
        <img src={trash} alt="delete" />
      </IconButton>
    </div>
  );
}

export default ActionsCell;
