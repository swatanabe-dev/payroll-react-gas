import { useNavigate } from "react-router-dom";

import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Table from "../../ui/Table";
import TableFooter from "../../ui/TableFooter";

import UserForm from "./UserForm";

import { useGetUsers } from "./useGetUsers";
import { useModal } from "../../contexts/ModalContext";

import { usersTableSchema } from "./schema/usersTableSchema";

import "./UsersTable.css";

function UsersTable() {
  const { modal, openModal } = useModal();
  const { data: users, isPending } = useGetUsers();
  const navigate = useNavigate();

  const count = users?.length ?? 0;

  const tableSchema = usersTableSchema;

  function handleClickRow(user) {
    navigate(`/users/${user.uuid}`, { replace: false });
  }

  if (isPending)
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading>Reading data...</Loading>
        </div>
      </Modal>
    );

  return (
    <>
      <div className="users-table-operations">
        <Button
          onClickFunction={() => openModal("USER_ADD")}
          isDisabled={isPending}
        >
          Add Employee
        </Button>
      </div>

      <div className="users-table">
        <Table
          fields={tableSchema}
          data={users ?? []}
          onRowClick={handleClickRow}
          isFullWidth={true}
        />
        <TableFooter count={count} unit="Employees" />
      </div>
      {modal?.type === "USER_ADD" && (
        <Modal>
          <UserForm />
        </Modal>
      )}
    </>
  );
}

export default UsersTable;
