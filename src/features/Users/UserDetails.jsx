import { useParams } from "react-router-dom";

import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import ListRow from "../../ui/ListRow";
import ConfirmAction from "../../ui/ConfirmAction";

import UserForm from "./UserForm";
import { useModal } from "../../contexts/ModalContext";
// import { formatDateToJp } from "../../utils/formatDateToJp";
import { isUnderContract } from "../../utils/isUnderContract";
import { formatNumber } from "../../utils/formatNumber";

import { useGetUserDetails } from "./useGetUser";
import { useDeleteUser } from "./useDeleteUser";

import "./UserDetails.css";
import { formatDateToEng } from "../../utils/formatDateToEng";

function UserDetails() {
  const { data, isPending } = useGetUserDetails();
  const { modal, openModal, closeModal } = useModal();
  const { isDeleting, deleteUser } = useDeleteUser();
  const { userId } = useParams();

  if (isPending || !data)
    return (
      <div className="loading-container">
        <Loading>Reading employee details...</Loading>
      </div>
    );

  const {
    firstName,
    lastName,
    dob,
    userFee,
    paymentMethod,
    dateJoined,
    dateLeft,
    memo,
  } = data;

  const contractStatus = isUnderContract(dateLeft);
  const formattedDateJoined = formatDateToEng(dateJoined);
  const formattedDateLeft = formatDateToEng(dateLeft);
  const formattedUserFee = formatNumber(userFee);
  const formattedPaymentMethod =
    paymentMethod === "deposit" ? "Deposit" : "Cash";
  const formattedDob = formatDateToEng(dob);

  // function handleClick(formType) {
  //   onClickModal(formType);
  // }

  return (
    <div className="user-details">
      <div className="indented-border">
        <div className="user-info-header">
          <Heading
            type="h2-bold"
            className={`customNameStyle`}
          >{`${firstName} ${lastName}`}</Heading>
        </div>
        <div className="user-info-container">
          <ListRow valueType="text" itemLabel="Status">
            {contractStatus}
          </ListRow>

          <ListRow itemLabel="Joined on">{formattedDateJoined}</ListRow>

          <ListRow itemLabel="Left on" itemValue={dateLeft}>
            {formattedDateLeft}
          </ListRow>

          <ListRow valueType="text" itemLabel="User Fees" unit="JPY">
            {formattedUserFee}
          </ListRow>

          <ListRow valueType="text" itemLabel="Payment">
            {formattedPaymentMethod}
          </ListRow>

          <ListRow itemLabel="DOB">{formattedDob}</ListRow>

          <div>
            <ListRow valueType="memo" itemLabel={`Memo`}>
              {memo}
            </ListRow>
          </div>
          <div className="user-info-btns">
            <Button
              buttonStyle="secondary"
              buttonSize="btn--md"
              onClickFunction={() => openModal("USER_EDIT", data)}
            >
              Update
            </Button>
          </div>
        </div>
        {modal?.type === "USER_EDIT" && (
          <Modal>
            <UserForm userInfoToEdit={modal.payload} onClose={closeModal} />
          </Modal>
        )}
        {modal?.type === "CONFIRM_DELETE" && (
          <Modal>
            <ConfirmAction
              onCancel={closeModal}
              onConfirm={() => deleteUser(userId)}
              isProcessing={isDeleting}
            />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default UserDetails;
