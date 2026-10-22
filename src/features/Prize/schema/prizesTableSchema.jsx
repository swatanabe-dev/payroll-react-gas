import PrizeTableHeader from "../PrizeTableHeader";

export const prizesTableSchema = ({ year }) => [
  {
    key: "name",
    label: "Name",
    render: (row) => row?.name,
    textAlign: "center",
  },
  {
    key: "apr",
    label: <PrizeTableHeader year={year} month="Apr" />,
    render: (row) => row.apr ?? false,
    textAlign: "center",
  },
  {
    key: "may",
    label: <PrizeTableHeader year={year} month="May" />,
    render: (row) => row.may ?? false,
    textAlign: "center",
  },
  {
    key: "jun",
    label: <PrizeTableHeader year={year} month="Jun" />,
    render: (row) => row.jun ?? false,
    textAlign: "center",
  },
  {
    key: "jul",
    label: <PrizeTableHeader year={year} month="Jul" />,
    render: (row) => row.jul ?? false,
    textAlign: "center",
  },
  {
    key: "aug",
    label: <PrizeTableHeader year={year} month="Aug" />,
    render: (row) => row.aug ?? false,
    textAlign: "center",
  },
  {
    key: "sep",
    label: <PrizeTableHeader year={year} month="Sep" />,
    render: (row) => row.sep ?? false,
    textAlign: "center",
  },
  {
    key: "oct",
    label: <PrizeTableHeader year={year} month="Oct" />,
    render: (row) => row.oct ?? false,
    textAlign: "center",
  },
  {
    key: "nov",
    label: <PrizeTableHeader year={year} month="Nov" />,
    render: (row) => row.nov ?? false,
    textAlign: "center",
  },
  {
    key: "dec",
    label: <PrizeTableHeader year={year} month="Dec" />,
    render: (row) => row.dec ?? false,
    textAlign: "center",
  },
  {
    key: "jan",
    label: <PrizeTableHeader year={year} month="Jan" />,
    render: (row) => row.jan ?? false,
    textAlign: "center",
  },
  {
    key: "feb",
    label: <PrizeTableHeader year={year} month="Feb" />,
    render: (row) => row.feb ?? false,
    textAlign: "center",
  },
  {
    key: "mar",
    label: <PrizeTableHeader year={year} month="Mar" />,
    render: (row) => row.mar ?? false,
    textAlign: "center",
  },
];
