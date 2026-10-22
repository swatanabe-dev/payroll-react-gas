export const ARCHIVE_STATUS = {
  UNARCHIVED: "unarchived",
  UNVERIFIED: "unverified",
  UNPURGED: "unpurged",
  COMPLETE: "complete",
};

export const ARCHIVE_STATUS_DISPLAY = {
  [ARCHIVE_STATUS.UNARCHIVED]: {
    label: "Unarchived",
    className: "status--danger",
  },
  [ARCHIVE_STATUS.UNVERIFIED]: {
    label: "Unverified",
    className: "status--warning",
  },
  [ARCHIVE_STATUS.UNPURGED]: { label: "Not purged", className: "status--info" },
  [ARCHIVE_STATUS.COMPLETE]: {
    label: "Completed✔",
    className: "status--success",
  },
};

/**
 *  @param {Object} archive - a row from the archives sheet
 *  @returns {string} one of ARCHIVE_STATUS
 */
export function getArchiveStatus(archive) {
  if (!archive?.createdAt) return ARCHIVE_STATUS.UNARCHIVED;
  if (!archive.verifiedAt) return ARCHIVE_STATUS.UNVERIFIED;
  if (!archive.purgedAt) return ARCHIVE_STATUS.UNPURGED;
  return ARCHIVE_STATUS.COMPLETE;
}
