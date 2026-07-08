const SHEET_ID = "PEGA_AQUI_EL_ID_DE_TU_HOJA";
const SHEET_NAME = "Hoja 1";
const PRESENT_VALUE = "Presente";
const TIMEZONE = "America/Santiago";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const rutCandidates = rutCandidatesFrom([payload.rut, payload.rawRut]);
    const date = String(payload.date || "").trim();
    const value = String(payload.value || PRESENT_VALUE).trim() || PRESENT_VALUE;

    if (!rutCandidates.length) return jsonResponse({ ok: false, message: "No se recibió un RUT válido." }, 400);
    if (!date) return jsonResponse({ ok: false, message: "No se recibió una fecha válida." }, 400);

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return jsonResponse({ ok: false, message: "No se encontró la hoja indicada." }, 404);

    const range = sheet.getDataRange();
    const values = range.getValues();
    if (values.length < 2) return jsonResponse({ ok: false, message: "La hoja no tiene datos para buscar." }, 404);

    const headers = values[0];
    const rutColumn = findHeader(headers, "rut");
    const rutDvColumn = findHeader(headers, "rutdv");
    const dateColumn = findDateHeader(headers, date);

    if (rutColumn === -1 && rutDvColumn === -1) {
      return jsonResponse({ ok: false, message: "No se encontró la columna RUT." }, 404);
    }

    if (dateColumn === -1) {
      return jsonResponse({ ok: false, message: "No se encontró la columna de fecha " + date + "." }, 404);
    }

    const rowIndex = findPersonRow(values, rutCandidates, rutColumn, rutDvColumn);
    if (rowIndex === -1) {
      return jsonResponse({ ok: false, message: "No se encontró el RUT " + rutCandidates[0] + " en la hoja." }, 404);
    }

    sheet.getRange(rowIndex + 1, dateColumn + 1).setValue(value);

    return jsonResponse({
      ok: true,
      message: "Asistencia registrada.",
      row: rowIndex + 1,
      column: dateColumn + 1,
      person: buildPerson(values[rowIndex], headers)
    });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message || "Error inesperado." }, 500);
  }
}

function findPersonRow(values, searchedRutCandidates, rutColumn, rutDvColumn) {
  for (let row = 1; row < values.length; row++) {
    const rutValues = rutColumn >= 0 ? rutCandidatesFrom([values[row][rutColumn]]) : [];
    const rutDvValues = rutDvColumn >= 0 ? rutCandidatesFrom([values[row][rutDvColumn]]) : [];
    const rowCandidates = rutValues.concat(rutDvValues);

    if (rowCandidates.some((candidate) => searchedRutCandidates.indexOf(candidate) >= 0)) {
      return row;
    }
  }

  return -1;
}

function findHeader(headers, expected) {
  return headers.findIndex((header) => normalizeHeader(header) === expected);
}

function findDateHeader(headers, expectedDate) {
  return headers.findIndex((header) => {
    if (header instanceof Date) {
      return Utilities.formatDate(header, TIMEZONE, "dd-MM-yyyy") === expectedDate;
    }

    return String(header).trim() === expectedDate;
  });
}

function buildPerson(row, headers) {
  const names = getByHeader(row, headers, "nombres");
  const paternal = getByHeader(row, headers, "apellidopaterno");
  const maternal = getByHeader(row, headers, "apellidomaterno");
  const fullName = [names, paternal, maternal].filter(Boolean).join(" ").trim();

  return {
    fullName,
    names,
    paternal,
    maternal,
    course: getByHeader(row, headers, "curso")
  };
}

function getByHeader(row, headers, expected) {
  const index = findHeader(headers, expected);
  return index >= 0 ? String(row[index] || "").trim() : "";
}

function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeRut(value) {
  const clean = String(value || "").toUpperCase().replace(/[^0-9K]/g, "");
  if (!clean) return "";
  if (clean.endsWith("K")) return clean.slice(0, -1);
  if (clean.length >= 8 && String(value).includes("-")) return clean.slice(0, -1);
  return clean;
}

function rutCandidatesFrom(values) {
  const candidates = [];

  values.forEach((value) => {
    const clean = String(value || "").toUpperCase().replace(/[^0-9K]/g, "");
    if (!clean) return;

    candidates.push(clean);

    if (clean.endsWith("K")) {
      candidates.push(clean.slice(0, -1));
    }

    if (clean.length >= 7) {
      candidates.push(clean.slice(0, -1));
    }
  });

  return candidates.filter((candidate, index) => candidate && candidates.indexOf(candidate) === index);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
