import ArchiveActionCell from "../../../ui/ArchiveActionCell";
import { formatToLocalDate } from "../../../utils/formatToLocalDate";
import {
  ARCHIVE_STATUS_DISPLAY,
  getArchiveStatus,
} from "../../../utils/getArchiveStatus";

export const archivesTableSchema = ({
  onVerify,
  onPurge,
  pendingArchiveId,
}) => [
  {
    key: "fiscalYear",
    label: "Fiscal Year",
    render: (archive) => `FY${archive.fiscalYear}`,
    textAlign: "left",
  },
  {
    key: "status",
    label: "Status",
    render: (archive) => {
      const { label, className } =
        ARCHIVE_STATUS_DISPLAY[getArchiveStatus(archive)];
      return <p className={`archives__status ${className}`}>{label}</p>;
    },
    textAlign: "center",
  },
  {
    key: "fileUrl",
    label: "File",
    render: (archive) =>
      archive.fileUrl ? (
        <a href={archive.fileUrl} target="_blank" rel="noopener noreferrer">
          Open
        </a>
      ) : (
        "―"
      ),
    textAlign: "center",
  },
  {
    key: "createdAt",
    label: "Archived at",
    render: (archive) =>
      archive.createdAt ? formatToLocalDate(archive.createdAt) : "―",
    textAlign: "left",
  },
  {
    key: "verifiedAt",
    label: "Verified at",
    render: (archive) =>
      archive.verifiedAt ? formatToLocalDate(archive.verifiedAt) : "―",
    textAlign: "left",
  },
  {
    key: "purgedAt",
    label: "Purged at",
    render: (archive) =>
      archive.purgedAt ? formatToLocalDate(archive.purgedAt) : "―",
    textAlign: "left",
  },
  {
    key: "actions",
    label: "Action",
    render: (archive) => (
      <ArchiveActionCell
        archive={archive}
        onVerify={onVerify}
        onPurge={onPurge}
        isPending={pendingArchiveId === archive.archiveId}
      />
    ),
    textAlign: "center",
  },
];
