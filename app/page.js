// app/page.js
"use client";

import React, { useState, useEffect } from "react";
import RoomGrid from "../components/RoomGrid";
import ImportData from "../components/ImportData";
import StaffManagement from "../components/StaffManagement";
import RoomDistribution from "../components/RoomDistribution";
import ManualAssignment from "../components/ManualAssignment";
import RoomSearch from "../components/RoomSearch";
import DailyReport from "../components/DailyReport";
import Controls from "../components/Controls";
import ErrorManagement from "../components/ErrorManagement";
import { analyzeRoomData } from "../utils/hotelUtils";

// Initialisation des chambres avec les données par défaut
const defaultRooms = [
  {
    number: "101",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "102",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "103",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "104",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "105",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "106",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "107",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "108",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "109",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "110",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "111",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "112",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "113",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "114",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "115",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "116",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "117",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "118",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "119",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "120",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "201",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "202",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "203",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "204",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "205",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "206",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "207",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "208",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "209",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "210",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "211",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "212",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "213",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "214",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "215",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "216",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "217",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "218",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "219",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "220",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "301",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "302",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "303",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "304",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "305",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "306",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "307",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "308",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "309",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "310",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "311",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "312",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "313",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "314",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "315",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "316",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "317",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "318",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "319",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "320",
    state: "Libre",
    type: "TWTW",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "401",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "402",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "403",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "404",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "405",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "406",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "407",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "408",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "409",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "410",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "411",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "412",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "413",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "414",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "415",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "416",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "417",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "418",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "419",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "420",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "501",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "502",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "503",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "504",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "505",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "506",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "507",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "508",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "509",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "510",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "511",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "512",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "513",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "514",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "515",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "516",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "517",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "518",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "519",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "520",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "601",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "602",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "603",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "604",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "605",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "606",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "607",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "608",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "609",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "610",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "611",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "612",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "613",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "614",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "615",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "616",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "617",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "618",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "619",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
  {
    number: "620",
    state: "Libre",
    type: "KING",
    notes: [],
    assignedTo: null,
    checked: false,
    controlled: false,
    customNotes: "",
    lateDepartureTime: "",
  },
];

export default function HomePage() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [staffList, setStaffList] = useState([]);
  const [manualAssignmentActive, setManualAssignmentActive] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [activeTab, setActiveTab] = useState("rooms");
  const [userRole, setUserRole] = useState("gouvernante");
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [reportedErrors, setReportedErrors] = useState([]);
  const [resolvedErrors, setResolvedErrors] = useState([]);

  const toggleRoomChecked = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber
          ? {
              ...room,
              checked: !room.checked,
              state: room.state === "Départ" ? "Recouche" : room.state,
            }
          : room
      )
    );
  };

  const toggleRoomControlled = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber
          ? { ...room, controlled: !room.controlled }
          : room
      )
    );
  };

  const toggleStar = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber && room.state === "Recouche"
          ? { ...room, star: !room.star }
          : room
      )
    );
  };

  const handleRoomClick = (roomNumber) => {
    if (manualAssignmentActive) {
      if (selectedEmployee) {
        assignRoom(roomNumber, selectedEmployee);
      } else {
        alert("Veuillez sélectionner un employé avant d'assigner une chambre.");
      }
    } else if (userRole === "gouvernante") {
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.number === roomNumber && !room.checked) {
            let newState;
            switch (room.state) {
              case "Libre":
                newState = "Départ";
                break;
              case "Départ":
                newState = "Recouche";
                break;
              case "Recouche":
                newState = "Libre";
                break;
              default:
                newState = "Libre";
            }
            return {
              ...room,
              state: newState,
              notes: [],
              checked: false,
              controlled: false,
              cleaningQuality: "",
              star: newState === "Recouche" ? room.star : false,
            };
          }
          return room;
        })
      );
    }
  };

  const handleNoteChange = (roomNumber, note, isChecked) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.number === roomNumber) {
          let newNotes = [...(room.notes || [])];
          if (isChecked) {
            if (room.state === "Départ") {
              if (note === "Départ tardif" && !newNotes.includes(note)) {
                newNotes.push(note);
              }
            } else if (room.state === "Recouche") {
              if (
                ["DND", "Refus", "LP"].includes(note) &&
                !newNotes.includes(note)
              ) {
                newNotes = [note];
              }
            }
          } else {
            newNotes = newNotes.filter((n) => n !== note);
          }
          return { ...room, notes: newNotes };
        }
        return room;
      })
    );
  };

  const handleLateDepartureTimeChange = (roomNumber, time) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, lateDepartureTime: time } : room
      )
    );
  };

  const handleNotesChange = (roomNumber, customNotes) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, customNotes } : room
      )
    );
  };

  const handleImport = async (file) => {
    try {
      const importedRooms = await analyzeRoomData(file);
      setRooms(importedRooms);
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      alert("Une erreur est survenue lors de l'importation du fichier.");
    }
  };

  const addStaff = (name, contractType, preferredFloor) => {
    if (
      !staffList.some(
        (staff) => staff.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setStaffList([...staffList, { name, contractType, preferredFloor }]);
    } else {
      alert("Un employé avec ce nom existe déjà.");
    }
  };

  const assignRoom = (roomNumber, employeeName) => {
    const roomAlreadyAssigned = rooms.some(
      (room) => room.number === roomNumber && room.assignedTo !== null
    );
    if (roomAlreadyAssigned) {
      alert("Cette chambre est déjà assignée à un employé.");
      return;
    }

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber
          ? { ...room, assignedTo: employeeName }
          : room
      )
    );
  };

  const unassignRoom = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, assignedTo: null } : room
      )
    );
  };

  const handleCleaningQuality = (roomNumber, quality) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber
          ? { ...room, cleaningQuality: quality }
          : room
      )
    );
  };

  const reportError = (roomNumber, errorState) => {
    const room = rooms.find((room) => room.number === roomNumber);
    if (room) {
      const error = {
        roomNumber,
        errorState,
        maid: selectedEmployee,
      };
      setReportedErrors([...reportedErrors, error]);
      alert("Erreur rapportée. La gouvernante sera informée.");
    }
  };

  const handleNewAssignment = (errorIndex, newRoomNumber) => {
    const updatedErrors = [...reportedErrors];
    const error = updatedErrors[errorIndex];

    if (error) {
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.number === newRoomNumber) {
            return { ...room, assignedTo: error.maid };
          } else if (room.number === error.roomNumber) {
            return { ...room, assignedTo: null };
          }
          return room;
        })
      );

      const jeanneRooms = rooms.filter(
        (room) => room.assignedTo === error.maid
      );

      if (jeanneRooms.length > 0) {
        const roomToReassign = jeanneRooms[0];

        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.number === roomToReassign.number
              ? { ...room, assignedTo: "Marie" }
              : room
          )
        );

        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.number === error.roomNumber
              ? {
                  ...room,
                  notes: [
                    ...(room.notes || []),
                    `Erreur signalée par ${error.maid}.`,
                  ],
                }
              : room
          )
        );

        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.number === newRoomNumber
              ? {
                  ...room,
                  notes: [
                    ...(room.notes || []),
                    `Chambre réattribuée à ${error.maid}.`,
                  ],
                }
              : room
          )
        );

        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.number === roomToReassign.number
              ? {
                  ...room,
                  notes: [
                    ...(room.notes || []),
                    `Chambre réattribuée à Marie.`,
                  ],
                }
              : room
          )
        );

        updatedErrors.splice(errorIndex, 1);
        setReportedErrors(updatedErrors);

        const resolvedError = {
          ...error,
          newRoomNumber,
          roomToReassign: roomToReassign.number,
        };
        setResolvedErrors([...resolvedErrors, resolvedError]);
      }
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser l'application ? Toutes les données seront perdues."
      )
    ) {
      setRooms(defaultRooms);
      setStaffList([]);
      setReportedErrors([]);
      setResolvedErrors([]);
      localStorage.clear();
    }
  };

  const generateReport = () => {
    const report = {
      totalRooms: rooms.length,
      departures: rooms.filter((room) => room.state === "Départ").length,
      recouches: rooms.filter((room) => room.state === "Recouche").length,
      assignedRooms: rooms.filter((room) => room.assignedTo).length,
      cleanedRooms: rooms.filter((room) => room.checked).length,
      staffCount: staffList.length,
    };

    console.log("Rapport généré:", report);
    alert("Rapport généré. Veuillez consulter la console pour les détails.");
  };

  useEffect(() => {
    const savedRooms = localStorage.getItem("rooms");
    const savedStaff = localStorage.getItem("staff");
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
  }, []);

  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
    localStorage.setItem("staff", JSON.stringify(staffList));
  }, [rooms, staffList]);

  const getFloors = () => {
    const floorSet = new Set(rooms.map((room) => room.number.charAt(0)));
    return Array.from(floorSet);
  };

  const filteredRooms =
    selectedFloor === "All"
      ? rooms
      : rooms.filter((room) => room.number.startsWith(selectedFloor));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-700">
        Hôtel Cleaning Optimizer Pro
      </h1>

      <div className="flex justify-center mb-4">
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="w-full max-w-xs p-2 border rounded-md"
        >
          <option value="gouvernante">Gouvernante</option>
          <option value="femmeDeChambre">Femme de Chambre</option>
        </select>
      </div>

      <div className="flex justify-center mb-4">
        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="w-full max-w-xs p-2 border rounded-md"
        >
          <option value="All">Tous les étages</option>
          {getFloors().map((floor) => (
            <option key={floor} value={floor}>
              Étage {floor}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div
          className={`space-y-8 ${
            activeTab !== "rooms" ? "hidden md:block" : ""
          }`}
        >
          {userRole === "gouvernante" && <ImportData onImport={handleImport} />}
          <RoomGrid
            rooms={filteredRooms}
            onRoomClick={handleRoomClick}
            toggleStar={toggleStar}
            toggleRoomChecked={toggleRoomChecked}
            toggleRoomControlled={toggleRoomControlled}
            handleNoteChange={handleNoteChange}
            manualAssignmentActive={manualAssignmentActive}
            selectedEmployee={selectedEmployee}
            handleLateDepartureTimeChange={handleLateDepartureTimeChange}
            handleNotesChange={handleNotesChange}
            userRole={userRole}
            handleCleaningQuality={handleCleaningQuality}
            reportError={reportError}
          />
          {userRole === "gouvernante" && (
            <ManualAssignment
              staff={staffList}
              rooms={rooms}
              assignRoom={assignRoom}
              manualAssignmentActive={manualAssignmentActive}
              setManualAssignmentActive={setManualAssignmentActive}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              unassignRoom={unassignRoom}
            />
          )}
        </div>

        <div
          className={`space-y-8 ${
            activeTab !== "staff" ? "hidden md:block" : ""
          }`}
        >
          {userRole === "gouvernante" && (
            <StaffManagement staffList={staffList} addStaff={addStaff} />
          )}
          {userRole === "gouvernante" && (
            <RoomDistribution
              rooms={rooms}
              setRooms={setRooms}
              staffList={staffList}
            />
          )}
        </div>

        <div
          className={`space-y-8 ${
            activeTab !== "reports" ? "hidden md:block" : ""
          }`}
        >
          <RoomSearch rooms={rooms} />
          {userRole === "gouvernante" && <DailyReport rooms={rooms} />}
          {userRole === "gouvernante" && (
            <Controls onReset={handleReset} onGenerateReport={generateReport} />
          )}
        </div>
      </div>

      {userRole === "gouvernante" && (
        <ErrorManagement
          rooms={rooms}
          staffList={staffList}
          reportedErrors={reportedErrors}
          handleNewAssignment={handleNewAssignment}
          resolvedErrors={resolvedErrors}
        />
      )}

      {userRole === "femmeDeChambre" && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-4 border-t-4 border-green-500">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Résumé des Erreurs
          </h2>
          {resolvedErrors.length === 0 ? (
            <p className="text-gray-700">Aucune erreur résolue.</p>
          ) : (
            resolvedErrors.map((resolvedError, index) => (
              <div
                key={index}
                className="p-4 mb-4 border rounded bg-green-100 border-green-500"
              >
                <p className="text-sm font-semibold text-green-800">
                  Chambre: {resolvedError.roomNumber} corrigée.
                </p>
                <p className="text-sm text-green-800">
                  Nouvelle chambre assignée: {resolvedError.newRoomNumber}
                </p>
                <p className="text-sm text-green-800">
                  Femme de Chambre: {resolvedError.maid}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
