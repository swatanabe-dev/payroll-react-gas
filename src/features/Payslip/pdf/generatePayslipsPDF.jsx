import { pdf } from "@react-pdf/renderer";
import { zipSync } from "fflate";

import { getFormattedLocalTimestamp } from "../../../utils/getLocalTimestamp";
import { MAX_PAYSLIPS_PER_FILE } from "../../../utils/constants";

import MultiPayslipDocument from "./MultiPayslipDocument";

// ─── Helpers ──────────────────────────────────────────────────────
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Blob -> Uint8Array without touching Buffer
async function blobToUint8Array(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);
}

// For rendering memory safety and UI yielding between batches
function pauseForGarbageCollection(ms = 1500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main Execution ──────────────────────────────────────────────
// generatePayslipsPDF.js
export async function generatePayslipsPDF(payslips, onProgress) {
  const batches = chunkArray(payslips, MAX_PAYSLIPS_PER_FILE);
  const timestamp = getFormattedLocalTimestamp();
  const isMultiFile = batches.length > 1;

  const filesToZip = {};

  for (let i = 0; i < batches.length; i++) {
    onProgress?.({ current: i + 1, total: batches.length, phase: "rendering" });

    const blob = await pdf(
      <MultiPayslipDocument payslips={batches[i]} />,
    ).toBlob();

    const filename = isMultiFile
      ? `Pay-Stubs-${i + 1}_of_${batches.length}_${timestamp}.pdf`
      : `Pay-Stub-${timestamp}.pdf`;

    if (!isMultiFile) {
      downloadBlob(blob, filename);
      return;
    }

    filesToZip[filename] = await blobToUint8Array(blob);

    if (i < batches.length - 1) {
      await pauseForGarbageCollection(1500);
    }
  }

  onProgress?.({
    current: batches.length,
    total: batches.length,
    phase: "zipping",
  });

  const zipped = zipSync(filesToZip, { level: 1 });
  const zipBlob = new Blob([zipped], { type: "application/zip" });

  downloadBlob(zipBlob, `Pay-Stubs-${timestamp}.zip`);
}
