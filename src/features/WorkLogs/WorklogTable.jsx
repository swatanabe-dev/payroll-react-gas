import { useCallback, useMemo } from "react";

import { useDeleteWorkLog } from "./useDeleteWorkLog";
import { useGetPaginatedWorkLogs } from "./useGetPaginatedWorkLogs";
import { useModal } from "../../contexts/ModalContext";

import { worklogsTableSchema } from "./schema/worklogsTableSchema";

import Button from "../../ui/Button";
import Search from "../../ui/Search";
import Pagination from "../../ui/Pagination";
import Modal from "../../ui/Modal";
import Loading from "../../ui/Loading";
import ConfirmAction from "../../ui/ConfirmAction";
import Table from "../../ui/Table";
import WorkLogForm from "./WorkLogForm";

import "./WorklogTable.css";

// Search categories configuration
const searchOptions = [
  { value: "name", label: "Name" },
  { value: "workType", label: "Work Type" }, // inside GAS, matching column field name
  { value: "date", label: "Date (YYYY-MM-DD)" },
];

function WorklogTable() {
  const { worklogs, count, isPending, isPrefetchingNext, isPrefetchingPrev } =
    useGetPaginatedWorkLogs();
  const { isDeleting, deleteWorkLog } = useDeleteWorkLog();
  const { modal, openModal, closeModal } = useModal();

  // --- handlers passed into schema ---
  const handleEdit = useCallback(
    (id) => {
      const dataToEdit = worklogs?.find((log) => log.workLogId === id);
      if (dataToEdit) openModal("WORKLOG_EDIT", dataToEdit);
    },
    [worklogs, openModal],
  );

  const handleDeleteRequest = useCallback(
    (id) => {
      openModal("WORKLOG_DEL_CONFIRM", id);
    },
    [openModal],
  ); // Dependency: openModal

  const handleDeleteConfirm = () => {
    const idToDelete = modal?.payload;
    deleteWorkLog(idToDelete, { onSettled: () => closeModal() });
  };

  // --- schema is memoized to avoid re-creation ---
  const fields = useMemo(
    () =>
      worklogsTableSchema({
        onEdit: handleEdit,
        onDelete: handleDeleteRequest,
      }),
    [handleEdit, handleDeleteRequest],
  );

  if (isPending)
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading>Reading worklogs...</Loading>
        </div>
      </Modal>
    );

  return (
    <>
      <div className="worklogs-table-operations">
        <Button onClickFunction={() => openModal("WORKLOG_ADD")}>
          Add Worklog
        </Button>
        <Search options={searchOptions} />
      </div>

      <div className="worklogs-table ">
        <Table fields={fields} data={worklogs ?? []} isFullWidth={true} />
        <Pagination
          count={count}
          isPrevPending={isPrefetchingPrev}
          isNextPending={isPrefetchingNext}
        />
      </div>

      {(modal?.type === "WORKLOG_ADD" || modal?.type === "WORKLOG_EDIT") && (
        <Modal>
          <WorkLogForm
            logToEdit={modal?.type === "WORKLOG_EDIT" ? modal?.payload : {}}
          />
        </Modal>
      )}

      {modal?.type === "WORKLOG_DEL_CONFIRM" && (
        <Modal>
          <ConfirmAction
            onCancel={closeModal}
            onConfirm={handleDeleteConfirm}
            isProcessing={isDeleting}
          />
        </Modal>
      )}
    </>
  );
}

export default WorklogTable;
