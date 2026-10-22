import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import TableFooter from "../../ui/TableFooter";

import { useGetUserSavings } from "./useGetUserSavings";
import { useModal } from "../../contexts/ModalContext";

import { savingsTableSchema } from "./schema/savingsTableSchema";
import { calculateEndingBalance } from "../../utils/calculateEndingBalance";
import { formatNumber } from "../../utils/formatNumber";
import SavingsForm from "./SavingsForm";

import "./Savings.css";

function Savings() {
  const { modal, openModal, closeModal } = useModal();
  const { data, isPending } = useGetUserSavings();

  if (isPending)
    return (
      <div className="loading-container">
        <Loading>Reading savings...</Loading>
      </div>
    );

  const rows = data?.length ? calculateEndingBalance(data) : [];
  const currBal = rows.length > 0 ? formatNumber(rows?.at(0).endBal) : "0";
  const tableSchema = savingsTableSchema;

  const count = rows.length;

  function onRowClick(data) {
    openModal("SAVINGS_EDIT", data);
  }
  return (
    <>
      <div className="savings">
        <div className="savings__header">
          <div className="savings__summary">
            <Heading type="h3-bold">Savings</Heading>
            <p className="savings__message">
              Current Balance:
              <span className="savings__balance">{currBal}</span> JPY
            </p>
          </div>
          <div className="savings__actions">
            <Button
              buttonSize="btn--lg"
              onClickFunction={() => openModal("SAVINGS_ADD")}
            >
              Add Transaction
            </Button>
          </div>
        </div>
        <div className="savings__table">
          <Table fields={tableSchema} data={rows} onRowClick={onRowClick} />
          <TableFooter count={count} unit="transactions" />
        </div>
      </div>
      {(modal?.type === "SAVINGS_ADD" || modal?.type === "SAVINGS_EDIT") && (
        <Modal>
          <SavingsForm
            transactionToEdit={
              modal?.type === "SAVINGS_EDIT" ? modal?.payload : {}
            }
            onClose={closeModal}
          />
        </Modal>
      )}
    </>
  );
}

export default Savings;
