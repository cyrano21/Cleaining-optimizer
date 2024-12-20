// app/page.js
"use client";

import React, { useState, useEffect } from "react";
import RoomGrid from "../components/RoomGrid";
import StaffManagement from "../components/StaffManagement";
import RoomDistribution from "../components/RoomDistribution";
import ManualAssignment from "../components/ManualAssignment";
import RoomSearch from "../components/RoomSearch";
import { performSearch } from "../utils/searchUtils";
import DailyReport from "../components/DailyReport";
import Controls from "../components/Controls";
import ErrorManagement from "../components/ErrorManagement";
import { analyzeRoomData } from "../utils/hotelUtils";
import { jsPDF } from 'jspdf';
import DataImport from "../components/DataImport";

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
  const [searchResults, setSearchResults] = useState([]); // Ajouté setSearchResults
  const [staffList, setStaffList] = useState([]);
  const [manualAssignmentActive, setManualAssignmentActive] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [userRole, setUserRole] = useState("gouvernante");
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [reportedErrors, setReportedErrors] = useState([]);
  const [resolvedErrors, setResolvedErrors] = useState([]);
  const [selectedErrorRoom, setSelectedErrorRoom] = useState("");
  const [selectedErrorState, setSelectedErrorState] = useState("");

  // Chargement initial des données depuis le localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem('roomsData');
    const savedReportedErrors = localStorage.getItem('reportedErrors');
    const savedResolvedErrors = localStorage.getItem('resolvedErrors');
    const savedStaffList = localStorage.getItem('staffList');

    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
    if (savedReportedErrors) {
      setReportedErrors(JSON.parse(savedReportedErrors));
    }
    if (savedResolvedErrors) {
      setResolvedErrors(JSON.parse(savedResolvedErrors));
    }
    if (savedStaffList) {
      setStaffList(JSON.parse(savedStaffList));
    }
  }, []);

  // Sauvegarde des données quand elles changent
  useEffect(() => {
    localStorage.setItem('roomsData', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('reportedErrors', JSON.stringify(reportedErrors));
  }, [reportedErrors]);

  useEffect(() => {
    localStorage.setItem('resolvedErrors', JSON.stringify(resolvedErrors));
  }, [resolvedErrors]);

  useEffect(() => {
    localStorage.setItem('staffList', JSON.stringify(staffList));
  }, [staffList]);

  const toggleRoomChecked = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, checked: !room.checked } : room
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

  const handleImport = async (importedData) => {
    try {
      // Fusionner les données importées avec les données existantes
      const mergedRooms = [...rooms];
      
      importedData.forEach(importedRoom => {
        const existingRoomIndex = mergedRooms.findIndex(
          room => room.number === importedRoom.number
        );
        
        if (existingRoomIndex !== -1) {
          // Mettre à jour la chambre existante
          mergedRooms[existingRoomIndex] = {
            ...mergedRooms[existingRoomIndex],
            ...importedRoom
          };
        } else {
          // Ajouter la nouvelle chambre
          mergedRooms.push(importedRoom);
        }
      });
      
      // Mettre à jour l'état et le localStorage
      setRooms(mergedRooms);
      localStorage.setItem('roomsData', JSON.stringify(mergedRooms));
      
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      // Gérer l'erreur si nécessaire
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

  const handleSearch = (searchTerm) => {
    // Définir handleSearch
    const results = performSearch(rooms, searchTerm);
    setSearchResults(results);
  };

  const reportError = (roomNumber, errorState) => {
    const room = rooms.find((room) => room.number === roomNumber);
    if (room) {
      const error = {
        roomNumber,
        errorState,
        maid: userRole,
      };
      setReportedErrors([...reportedErrors, error]);
      alert("Erreur rapportée. La gouvernante sera informée.");
      setSelectedErrorRoom("");
      setSelectedErrorState("");
    }
  };

  const handleReset = () => {
    if (userRole === "gouvernante") {
      localStorage.clear();
      setRooms(defaultRooms);
      setReportedErrors([]);
      setResolvedErrors([]);
      setStaffList([]);
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

  const getFloors = () => {
    const floorSet = new Set(rooms.map((room) => room.number.charAt(0)));
    return Array.from(floorSet);
  };

  const filteredRooms =
    selectedFloor === "All"
      ? rooms
      : rooms.filter((room) => room.number.startsWith(selectedFloor));

  // Filtrer les chambres assignées à l'employé actuel (femme de chambre)
  const assignedRooms = rooms.filter((room) => room.assignedTo === userRole);

  // Obtenir les chambres de l'étage pour l'erreur
  const floorRooms = rooms.filter((room) =>
    selectedFloor === "All" ? true : room.number.startsWith(selectedFloor)
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('fr-FR');
    
    // Configuration initiale du PDF
    doc.setFont('helvetica');
    doc.setFontSize(16);
    
    // Titre
    doc.text(`Rapport de Nettoyage - ${today}`, 20, 20);
    doc.setFontSize(12);
    
    // Informations de l'employé
    doc.text(`Employé: ${userRole}`, 20, 35);
    
    // En-tête du tableau
    let y = 50;
    doc.text('Chambre', 20, y);
    doc.text('État', 60, y);
    doc.text('Notes', 100, y);
    doc.line(20, y + 2, 190, y + 2);
    
    // Ne montrer que les chambres assignées à l'utilisateur actuel
    const userRooms = rooms.filter(room => room.assignedTo === userRole);
    
    // Contenu du tableau
    y += 10;
    userRooms.forEach((room) => {
      if (y > 270) { // Nouvelle page si nécessaire
        doc.addPage();
        y = 20;
      }
      
      doc.text(room.number.toString(), 20, y);
      doc.text(room.state, 60, y);
      
      // Gérer les notes longues
      const notes = room.notes.join(', ');
      if (notes.length > 40) {
        doc.text(notes.substring(0, 40) + '...', 100, y);
      } else {
        doc.text(notes || '-', 100, y);
      }
      
      y += 7;
    });
    
    // Ajouter la section des erreurs si présente
    const userErrors = reportedErrors.filter(error => error.maid === userRole);
    
    if (userErrors.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.text('Erreurs Signalées:', 20, y);
      doc.setFontSize(12);
      y += 10;
      
      userErrors.forEach(error => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`Chambre ${error.roomNumber} - ${error.errorState}`, 20, y);
        y += 7;
      });
    }
    
    // Sauvegarder le PDF avec le nom de l'utilisateur
    doc.save(`rapport-nettoyage-${userRole}-${today}.pdf`);
  };

  return (
    <div className="container mx-auto w-full px-4 py-8 max-w-screen-xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-indigo-700">
        Hôtel Cleaning Optimizer Pro
      </h1>

      {/* Sélection du rôle de l'utilisateur */}
      <div className="flex justify-center mb-4">
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="w-full max-w-xs p-2 border rounded-md text-xl"
        >
          <option value="gouvernante">Gouvernante</option>
          <option value="femme_de_chambre">Femme de chambre</option>
          {staffList.map((staff) => (
            <option key={staff.name} value={staff.name}>
              {staff.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection de l'étage */}
      <div className="flex justify-center mb-4">
        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="w-full max-w-xs p-2 border rounded-md text-xl"
        >
          <option value="All">Tous les étages</option>
          {getFloors().map((floor) => (
            <option key={floor} value={floor}>
              Étage {floor}
            </option>
          ))}
        </select>
      </div>

      {/* Importation et Recherche en haut de la page */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <DataImport onImportComplete={handleImport} />
        <RoomSearch rooms={rooms} onSearch={handleSearch} />
        {/* Affichage des résultats de recherche */}
        <div>
          {searchResults.map((room) => (
            <div key={room.number}>
              Chambre {room.number} - État: {room.state} - Employé:{" "}
              {room.assignedTo || "Non attribué"}
            </div>
          ))}
        </div>
      </div>

      {/* Conteneur principal pour tous les composants */}
      <div className="space-y-8">
        <RoomGrid
          rooms={userRole === "gouvernante" ? filteredRooms : assignedRooms}
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
          floorRooms={floorRooms}
        />

        {/* Interface Gouvernante */}
        {userRole === "gouvernante" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <StaffManagement
                rooms={rooms}
                staffList={staffList}
                addStaff={addStaff}
              />
            </div>

            <RoomDistribution
              rooms={rooms}
              setRooms={setRooms}
              staffList={staffList}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyReport rooms={rooms} />
              <Controls onReset={handleReset} onGenerateReport={generateReport} />
            </div>

            <ErrorManagement
              rooms={rooms}
              staffList={staffList}
              reportedErrors={reportedErrors}
              resolvedErrors={resolvedErrors}
              setRooms={setRooms}
              setReportedErrors={setReportedErrors}
              setResolvedErrors={setResolvedErrors}
              userRole={userRole}
            />
          </>
        )}

        {/* Interface Femme de Chambre */}
        {userRole !== "gouvernante" && (
          <div className="mt-8 bg-white shadow-lg rounded-lg p-4 border-t-4 border-red-500">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Erreurs de Nettoyage
            </h2>

            <div>
              {/* Affichage des erreurs rapportées par cette femme de chambre */}
              {reportedErrors
                .filter((error) => error.maid === userRole)
                .map((error, index) => (
                  <div
                    key={index}
                    className="p-4 mb-4 border rounded bg-red-100 border-red-500"
                  >
                    <p className="text-sm font-semibold text-red-800">
                      Chambre en Erreur : {error.roomNumber} (État:{" "}
                      {error.errorState})
                    </p>
                    <p className="text-sm text-red-800">
                      Statut : En attente de résolution
                    </p>
                  </div>
                ))}

              {/* Formulaire pour rapporter une nouvelle erreur */}
              <div className="mt-4 p-4 border-t-2 border-red-500">
                <h3 className="text-lg font-semibold text-red-500 mb-2">
                  Rapporter une erreur
                </h3>
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Chambre nettoyée par erreur :
                  </label>
                  <select
                    value={selectedErrorRoom}
                    onChange={(e) => setSelectedErrorRoom(e.target.value)}
                    className="w-full p-1 border rounded"
                  >
                    <option value="">Sélectionner une chambre</option>
                    {rooms.map((room) => (
                      <option key={room.number} value={room.number}>
                        {room.number}{" "}
                        {room.assignedTo === userRole ? "(Assignée)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    État de la chambre :
                  </label>
                  <select
                    value={selectedErrorState}
                    onChange={(e) => setSelectedErrorState(e.target.value)}
                    className="w-full p-1 border rounded"
                  >
                    <option value="">Sélectionner un état</option>
                    <option value="Libre">Libre</option>
                    <option value="Départ">Départ</option>
                    <option value="Recouche">Recouche</option>
                  </select>
                </div>
                <button
                  className="mt-2 w-full bg-red-500 text-white p-2 rounded"
                  onClick={() => reportError(selectedErrorRoom, selectedErrorState)}
                >
                  Soumettre l&apos;erreur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 right-4">
        <button
          onClick={generatePDF}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Télécharger le Rapport</span>
        </button>
      </div>
    </div>
  );
}
