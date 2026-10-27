/** Booking sidebar galleries — Iturrieta photography (local copies). */

const IMG = {
  txotx: "/images/iturrieta-txotx.jpg",
  kupelas: "/images/iturrieta-kupelas.jpg",
  orchard: "/images/iturrieta-orchard.jpg",
  terrace: "/images/iturrieta-terrace.jpg",
  apple: "/images/iturrieta-apple.jpg",
  farmhouse: "/images/iturrieta-about-farmhouse.jpg",
} as const;

export type BookingSlide = {
  src: string;
  altKey:
    | "gallery.altCheers"
    | "gallery.altSteak"
    | "gallery.altSeasonal"
    | "gallery.altCoastal"
    | "gallery.altBread"
    | "gallery.altGrillPlate";
  captionKey: string;
};

export type BookingVisualStep = "when" | "time" | "tableType" | "table" | "details" | "done";

export const bookingStepGalleries: Record<BookingVisualStep, BookingSlide[]> = {
  when: [
    {
      src: IMG.orchard,
      altKey: "gallery.altSeasonal",
      captionKey: "gallery.captions.whenCommunal",
    },
    {
      src: IMG.farmhouse,
      altKey: "gallery.altCoastal",
      captionKey: "gallery.captions.whenRoom",
    },
    {
      src: IMG.apple,
      altKey: "gallery.altBread",
      captionKey: "gallery.captions.whenSeason",
    },
  ],
  time: [
    {
      src: IMG.kupelas,
      altKey: "gallery.altSteak",
      captionKey: "gallery.captions.timeEvening",
    },
    {
      src: IMG.txotx,
      altKey: "gallery.altCheers",
      captionKey: "gallery.captions.timeTxotx",
    },
    {
      src: IMG.terrace,
      altKey: "gallery.altGrillPlate",
      captionKey: "gallery.captions.timeKitchen",
    },
  ],
  tableType: [
    {
      src: IMG.farmhouse,
      altKey: "gallery.altCoastal",
      captionKey: "gallery.captions.tableHall",
    },
    {
      src: IMG.terrace,
      altKey: "gallery.altSeasonal",
      captionKey: "gallery.captions.tableReady",
    },
    {
      src: IMG.kupelas,
      altKey: "gallery.altSteak",
      captionKey: "gallery.captions.detailsArrival",
    },
  ],
  table: [
    {
      src: IMG.farmhouse,
      altKey: "gallery.altCoastal",
      captionKey: "gallery.captions.tableHall",
    },
    {
      src: IMG.txotx,
      altKey: "gallery.altCheers",
      captionKey: "gallery.captions.tableLong",
    },
    {
      src: IMG.terrace,
      altKey: "gallery.altSeasonal",
      captionKey: "gallery.captions.tableReady",
    },
  ],
  details: [
    {
      src: IMG.apple,
      altKey: "gallery.altSeasonal",
      captionKey: "gallery.captions.detailsDish",
    },
    {
      src: IMG.kupelas,
      altKey: "gallery.altGrillPlate",
      captionKey: "gallery.captions.detailsArrival",
    },
    {
      src: IMG.orchard,
      altKey: "gallery.altBread",
      captionKey: "gallery.captions.detailsWelcome",
    },
  ],
  done: [
    {
      src: IMG.txotx,
      altKey: "gallery.altCheers",
      captionKey: "gallery.captions.doneHeld",
    },
    {
      src: IMG.terrace,
      altKey: "gallery.altSteak",
      captionKey: "gallery.captions.doneSeeYou",
    },
    {
      src: IMG.kupelas,
      altKey: "gallery.altCoastal",
      captionKey: "gallery.captions.doneTable",
    },
  ],
};
