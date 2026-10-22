import { useCallback, useMemo } from "react";

import { archivesTableSchema } from "./schema/archivesTableSchema";
import { useGetArchives } from "./useGetArchives";
import { useGetUnarchivedFiscalYears } from "./useGetUnarchivedFiscalYears";
import { useArchiveFiscalYear } from "./useArchiveFiscalYear";
import { useVerifyArchive } from "./useVerifyArchive";
import { usePurgePrevFyData } from "./usePurgePrevFyData";
import { useModal } from "../../contexts/ModalContext";

import Authorization from "../../ui/Authorization";
import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";
import TableFooter from "../../ui/TableFooter";

import "./Archives.css";

function Archives() {
  const { data: archives, isPending: isReading } = useGetArchives();
  const { data: fiscalYears, isPending: isCheckingUnarchived } =
    useGetUnarchivedFiscalYears();
  const { archiveFiscalYear, isArchiving } = useArchiveFiscalYear();
  const { verifyArchive, isVerifying } = useVerifyArchive();
  const { purgePrevFyData, isPurging } = usePurgePrevFyData();
  const { modal, openModal, closeModal } = useModal();

  const count = archives?.length ?? 0;

  // MODAL Openers
  const handleArchiveRequest = useCallback(
    (fy) => {
      openModal("ARCHIVE_CREATE", fy);
    },
    [openModal],
  );
  const handleVerifyRequest = useCallback(
    (archiveId) => {
      openModal("ARCHIVE_VERIFY", archiveId);
    },
    [openModal],
  );
  const handlePurgeRequest = useCallback(
    (archiveId) => {
      openModal("ARCHIVE_PURGE", archiveId);
    },
    [openModal],
  );

  // SUBMITS inputs in the modals
  const handleCreateSubmit = (authorizedBy) => {
    const fiscalYear = modal.payload;
    archiveFiscalYear({ fiscalYear, authorizedBy });
    closeModal();
  };
  const handleVerifySubmit = (authorizedBy) => {
    const archiveId = modal.payload;
    verifyArchive({ archiveId, authorizedBy });
    closeModal();
  };

  const handlePurgeSubmit = (authorizedBy) => {
    const archiveId = modal.payload.archiveId; 
    const targetFY = modal.payload.fiscalYear;
    purgePrevFyData({ archiveId, targetFY, authorizedBy });
    closeModal();
  };

  // Memoize schema to avoid re-creation on every render
  const fields = useMemo(
    () =>
      archivesTableSchema({
        onVerify: handleVerifyRequest,
        onPurge: handlePurgeRequest,
        pendingArchiveId: modal?.payload,
      }),
    [handleVerifyRequest, handlePurgeRequest, modal],
  );

  if (
    isReading ||
    isArchiving ||
    isCheckingUnarchived ||
    isVerifying ||
    isPurging
  )
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading>
            {isReading || isCheckingUnarchived ? "Reading" : "Processing"}{" "}
            data...
          </Loading>
        </div>
      </Modal>
    );

  return (
    <>
      <div className="archives">
        <Heading type="h3-bold">Archives</Heading>
        <div className="archives__header-section">
          <p className="archives__descriptions">
            This section allows you to archive one fiscal year&apos;s worth of
            records. To ensure this web app continues to run smoothly, please
            make sure to perform this operation once a year. After execution,
            the data will be saved in the <strong>[payroll-app]</strong>
            &nbsp;&rarr;&nbsp;
            <strong>[payroll-archives]</strong> folder. To prevent data loss,
            this process is divided into three steps. Please ensure that all
            necessary procedures and processing for the applicable fiscal year
            have been completed before proceeding.
          </p>

          <div className="archives__reminder-section">
            {fiscalYears.length > 0 ? (
              <>
                <p className="archives__reminder-message--warning">
                  Please click the button to archive the data for the following
                  period.
                </p>
                <div className="archives__archiving-buttons">
                  {fiscalYears.map((fy) => (
                    <Button
                      key={fy}
                      onClickFunction={() => handleArchiveRequest(fy)}
                    >
                      Save FY{fy} Data
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="archives__reminder-message--complete">
                  There is currently no data available to archive.
                </p>
                <p className="archives__reminder-message--info">
                  Please be sure to check back after the current fiscal year
                  ends. If archiving is required, a dedicated button will appear
                  here.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="archives__table-container">
          <Table fields={fields} data={archives} isFullWidth={true} />
          <TableFooter count={count} />
        </div>
      </div>

      {modal?.type === "ARCHIVE_CREATE" && (
        <Modal>
          <Authorization
            title={`Create Fiscal Year ${modal.payload} Archive.`}
            description="Step 1: Save a copy of the data to the archives."
            buttonText="Create"
            onSubmit={handleCreateSubmit}
            onCancel={closeModal}
            isProcessing={isArchiving || isVerifying || isPurging}
          />
        </Modal>
      )}

      {modal?.type === "ARCHIVE_VERIFY" && (
        <Modal>
          <Authorization
            title="Verify the copy in the archives."
            description="Step 2: Verify the consistency of the copy."
            buttonText="Verify"
            onSubmit={handleVerifySubmit}
            onCancel={closeModal}
            isProcessing={isArchiving || isVerifying || isPurging}
          />
        </Modal>
      )}

      {modal?.type === "ARCHIVE_PURGE" && (
        <Modal>
          <Authorization
            title="Purge old data (Permanent Deletion)"
            description="Step 3: ⚠️ This action cannot be undone. It will delete the completed fiscal year's data from the app."
            buttonText="Purge"
            onSubmit={handlePurgeSubmit}
            onCancel={closeModal}
            isProcessing={isArchiving || isVerifying || isPurging}
          />
        </Modal>
      )}
    </>
  );
}

export default Archives;
