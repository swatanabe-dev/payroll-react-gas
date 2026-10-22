import { ARCHIVE_STATUS, getArchiveStatus } from "../utils/getArchiveStatus";
import Button from "./Button";

import "./ArchiveActionCell.css";

function ArchiveActionCell({ archive, onVerify, onPurge, isPending }) {
  const status = getArchiveStatus(archive);

  if (status === ARCHIVE_STATUS.UNVERIFIED) {
    return (
      <Button
        onClickFunction={() => onVerify(archive.archiveId)}
        buttonStyle="primary--outlined"
        buttonSize="btn--sm"
        buttonRadius="square"
        isProcessing={isPending}
      >
        Verify
      </Button>
    );
  }

  if (status === ARCHIVE_STATUS.UNPURGED) {
    return (
      <Button
        onClickFunction={() => onPurge(archive)}
        buttonStyle="primary--outlined"
        buttonSize="btn--sm"
        buttonRadius="square"
        isProcessing={isPending}
      >
        Purge
      </Button>
    );
  }

  if (status === ARCHIVE_STATUS.COMPLETE) {
    return <p className="archive-actions__complete">Purged✅</p>;
  }

  return null; // COMPLETE — nothing left to do
}

export default ArchiveActionCell;
