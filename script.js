// Elemente aus DOM
const btnNeuesTodo = document.getElementById('btnNeuesTodo');
const todosuchen = document.getElementById('todosuchen');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modalNeuesTodo');
const modalsuchen = document.getElementById('modalSuche');
const btnAbbrechen = document.getElementById('btnAbbrechen');
const btnHinzufuegen = document.getElementById('btnHinzufuegen');
const btnloeschen = document.getElementById('btn-loeschen');
const btnSucheAbbrechen = document.getElementById('btnSucheAbbrechen');
const btnSuchen = document.getElementById('btnSuchen');
const modalAendern = document.getElementById('modalAendern');
const btnAendernAbbrechen = document.getElementById('btnAendernAbbrechen');
const btnAendernSpeichern = document.getElementById('btnAendernSpeichern');
let aktuelleEditId = null;
if (btnloeschen){
    btnloeschen.addEventListener('click', loeschen);
}

// Menü öffnen
function modalOeffnen() {
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

// Menü suchen
function modalSuchen(){
    overlay.classList.remove('hidden');
    modalsuchen.classList.remove('hidden');
}

// Menü schliessen
function modalSchliessen() {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
    modalsuchen.classList.add('hidden'); 
    formularZuruecksetzen();
    todosAnzeigen();
}

// Menü suchen schliessen
function modalSucheSchliessen() {
    overlay.classList.add('hidden');
    modalsuchen.classList.add('hidden');
    // Suchfelder clear
    document.getElementById('inputSuche').value = '';
    document.getElementById('filterKategorie').checked = false;
    document.getElementById('filterTitel').checked = false;
    document.getElementById('filterAutor').checked = false;
    document.getElementById('filterBeschreibung').checked = false;
    document.getElementById('sortDringlichkeit').checked = false;
    document.getElementById('sortPrioritaet').checked = false;
    todosAnzeigen();
}

// Menü ändern schliessen
function modalAendernSchliessen() {
    overlay.classList.add('hidden');
    modalAendern.classList.add('hidden');
    aktuelleEditId = null;
    todosAnzeigenSortiertNachPrio();
}

// Ändern
function todoAendern() {
    const titel = document.getElementById('editTitel').value.trim().replace(/</g, "");
    const art   = document.getElementById('editArt').value;
    const autor = document.getElementById('editAutor').value.trim().replace(/</g, "");
    const kategorie = document.getElementById('editKategorie').value;

    if (!titel || !art || !autor || !kategorie) {
        alert('Alle *-Felder sind obligatorisch.');
        return;
    }

    const date_start = document.getElementById('editStartdatum').value;
    const date_end   = document.getElementById('editEnddatum').value;

    if (isNaN(date_start.replace(/\./g, "")) || isNaN(date_end.replace(/\./g, ""))) {
        alert("Das Datum darf nur im folgenden Format\neingegeben werden: tt.mm.jjjj");
        return;
    }

    if (date_start && date_end && !isBiggerThan(date_start, date_end)) {
        alert("Fehler beim Datum:\nStart muss vor Ende liegen.");
        return;
    }

    const value = +document.getElementById('editFortschritt').value;
    const fortschritt = value > 100 ? 100 : value > 0 ? value : 0;

    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos = todos.map(t => {
        if (t.id !== aktuelleEditId) return t;
        return {
            ...t,
            titel,
            art,
            autor,
            kategorie,
            beschreibung: document.getElementById('editBeschreibung').value.trim().replace(/</g, ""),
            wichtig:  document.getElementById('editWichtig').checked,
            dringend: document.getElementById('editDringend').checked,
            startdatum: date_start || t.startdatum,
            enddatum:   date_end   || t.enddatum,
            fortschritt
        };
    });

    localStorage.setItem('todos', JSON.stringify(todos));
    modalAendernSchliessen();
}

// Suchefunktion
function sucheAusfuehren() {
    const suchbegriff = document.getElementById('inputSuche').value.trim().toLowerCase();

    const filterKategorie   = document.getElementById('filterKategorie').checked;
    const filterTitel       = document.getElementById('filterTitel').checked;
    const filterAutor       = document.getElementById('filterAutor').checked;
    const filterBeschreibung = document.getElementById('filterBeschreibung').checked;
    const sortDringlichkeit = document.getElementById('sortDringlichkeit').checked;
    const sortPrioritaet    = document.getElementById('sortPrioritaet').checked;

    // Wenn kein Filter
    const keinerGewählt = !filterKategorie && !filterTitel && !filterAutor && !filterBeschreibung;

    let todos = JSON.parse(localStorage.getItem('todos') || '[]');

    // Filtern
    if (suchbegriff !== '') {
        todos = todos.filter(function(todo) {
            if (keinerGewählt) {
                return (
                    todo.titel.toLowerCase().includes(suchbegriff) ||
                    todo.autor.toLowerCase().includes(suchbegriff) ||
                    todo.kategorie.toLowerCase().includes(suchbegriff) ||
                    (todo.beschreibung && todo.beschreibung.toLowerCase().includes(suchbegriff))
                );
            }
            return (
                (filterTitel && todo.titel.toLowerCase().includes(suchbegriff)) ||
                (filterAutor && todo.autor.toLowerCase().includes(suchbegriff)) ||
                (filterKategorie && todo.kategorie.toLowerCase().includes(suchbegriff)) ||
                (filterBeschreibung && todo.beschreibung && todo.beschreibung.toLowerCase().includes(suchbegriff))
            );
        });
    }

    function prioPunkte(todo) {
        if (todo.dringend && todo.wichtig) return 1; // Sofort erledigen
        if (todo.dringend && !todo.wichtig) return 2; // Gib es ab
        if (!todo.dringend && todo.wichtig) return 3; // Einplanen und Wohlfühlen
        return 4;                                      // Weg damit
    }

    if (sortDringlichkeit && sortPrioritaet) {
        todos.sort((a, b) => prioPunkte(a) - prioPunkte(b));
    } else if (sortDringlichkeit) {
        todos.sort((a, b) => (b.dringend === a.dringend ? 0 : b.dringend ? 1 : -1));
    } else if (sortPrioritaet) {
        todos.sort((a, b) => prioPunkte(a) - prioPunkte(b));
    }
    overlay.classList.add('hidden');
    modalsuchen.classList.add('hidden');
    todosAnzeigen(todos);
}

// Alles leeren
function formularZuruecksetzen() {
    document.getElementById('inputTitel').value = '';
    document.getElementById('selectArt').value = '';
    document.getElementById('inputAutor').value = '';
    document.getElementById('selectKategorie').value = '';
    document.getElementById('inputBeschreibung').value = '';
    document.getElementById('checkWichtig').checked = false;
    document.getElementById('checkDringend').checked = false;
    document.getElementById('inputStartdatum').value = '';
    document.getElementById('inputEnddatum').value = '';
    document.getElementById('inputFortschritt').value = '';
}

// Datum validieren
function isBiggerThan(date1,date2){
    const date1_unsafe = date1.replace(/\./g, "");
    const date2_unsafe = date2.replace(/\./g, "");
    /*if(!int_date1 || !int_date2){
        return true;
    }*/
    const tt1 = +date1_unsafe.substring(0, 2);
    const tt2 = +date2_unsafe.substring(0, 2);
    const mm1 = +date1_unsafe.substring(2, 4);
    const mm2 = +date2_unsafe.substring(2, 4);
    const jj1 = +date1_unsafe.substring(4, 8);
    const jj2 = +date2_unsafe.substring(4, 8);
    // 01.01.2025 01.01.2026
    if (jj1 < jj2) return true;
    if (jj1 > jj2) return false;

    if(mm1 < mm2) return true;
    if(mm1 > mm2) return false;

    if(tt1 < tt2) return true;
    if(tt1 > tt2) return false;

    return true;
    
}

function todoSpeichern() {

    // Validierung Titel
    const titel_unsicher    = document.getElementById('inputTitel').value.trim();
    const titel = titel_unsicher.replace(/</g, "");
    const art       = document.getElementById('selectArt').value;

    // Validierung Autor
    const autor_unsicher     = document.getElementById('inputAutor').value.trim();
    const autor = autor_unsicher.replace(/</g, "");
    const kategorie = document.getElementById('selectKategorie').value;

    // Validierung Beschreibung
    const beschreibung_unsicher = document.getElementById('inputBeschreibung').value.trim();
    const beschreibung = beschreibung_unsicher.replace(/</g, "");

    if (!titel || !art || !autor || !kategorie) {
        alert('Alle *-Felder sind obligatorisch.');
        return;
    }

    const date_start = document.getElementById('inputStartdatum').value;
    const date_start_int = date_start.replace(/\./g, "");
    const date_end = document.getElementById('inputEnddatum').value;
    const date_end_int = date_end.replace(/\./g, "");

    if (isNaN(date_end_int) || isNaN(date_start_int)) {
        alert("Das Datum darf nur im folgenden Format\neingegeben werden: tt.mm.jjjj");
        return;
    }

    // Validierung Fortschritt
    let fortschritt_final;
    const value = +document.getElementById('inputFortschritt').value; // + um Stringvergleich zu verhindern
    if(value > 100){
        fortschritt_final = 100;
    }else if(value <= 100 && value > 0){
        fortschritt_final = value;
    }else {
        fortschritt_final = 0;
    }

    // Validierung des Datums
    if(!isBiggerThan(document.getElementById('inputStartdatum').value.trim(),document.getElementById('inputEnddatum').value.trim())){
        alert("Fehler beim Datum:\nStart muss vor Ende liegen.");
        return;
    }



    // Wenn Startdatum Null ist
    let start;
    if (document.getElementById('inputStartdatum').value.trim() === '') {
        const heute = new Date();
        const tag   = String(heute.getDate()).padStart(2, '0');
        const monat = String(heute.getMonth() + 1).padStart(2, '0');
        const jahr  = heute.getFullYear();
        start = `${tag}.${monat}.${jahr}`;
    } else {
        start = document.getElementById('inputStartdatum').value.trim();
    }

    // Wenn Enddatum Null ist
    let end;
        if (document.getElementById('inputEnddatum').value.trim() === '') {
        const heute = new Date();
        const tag   = String(heute.getDate() + 1).padStart(2, '0');
        const monat = String(heute.getMonth() + 1).padStart(2, '0');
        const jahr  = heute.getFullYear();
        end = `${tag}.${monat}.${jahr}`;
    } else {
        end = document.getElementById('inputEnddatum').value.trim();
    }

    // Neues Obj
    const neuesTodo = {
        id:Date.now(),
        titel:titel,
        art:art,
        autor:autor,
        kategorie:kategorie,
        beschreibung:beschreibung,
        wichtig:document.getElementById('checkWichtig').checked,
        dringend:document.getElementById('checkDringend').checked,
        startdatum:start,
        enddatum:end,
        fortschritt:fortschritt_final
    };

    // Bestehende todos laden
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');

    // neues todo hinzufügen
    todos.push(neuesTodo);

    // localstorage speichern
    localStorage.setItem('todos', JSON.stringify(todos));

    // schliessen
    modalSchliessen();
}

function loeschen(){
    localStorage.removeItem('todos');
    todosAnzeigen();
}

// Event Listener
btnNeuesTodo.addEventListener('click', modalOeffnen);
btnAbbrechen.addEventListener('click', modalSchliessen);
todosuchen.addEventListener('click', modalSuchen);
overlay.addEventListener('click', modalSchliessen);
btnHinzufuegen.addEventListener('click', todoSpeichern);
btnSucheAbbrechen.addEventListener('click', modalSucheSchliessen);
btnSuchen.addEventListener('click', sucheAusfuehren);
btnAendernAbbrechen.addEventListener('click', modalAendernSchliessen);
btnAendernSpeichern.addEventListener('click', todoAendern);


document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        modalSchliessen();
    }
});

function todosAnzeigenSortiertNachPrio() {
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos.sort((a, b) => prioPunkte(a) - prioPunkte(b));
    todosAnzeigen(todos);
}

todosAnzeigenSortiertNachPrio();

function getcolor(kategorie){
    switch(kategorie){
        case 'Sport': return '#5477C4';
        case 'Arbeit': return '#de3f3f';
        case 'Privat': return '#07aa0c';
        case 'Reisen': return '#07aa0c';
        case 'Restaurant': return '#eb9249';
        default: return '#b2afaf';
    }
}

function getcolorofart(art){
    switch(art){
        case 'Task': return '#a9cdab';
        case 'Event': return '#78c5e1';
        default: return '#a9cdab';
    }
}

function getcolorofprio(prio){
    switch(prio){
        case 'Sofort erledigen': return '#ad0101';
        case 'Gib es ab': return '#ff0000';
        case 'Einplanen und Wohlfühlen': return '#ff7b00';
        case 'Weg damit': return '#ffbf00';
        default: return '#0fb83c';
    }
}

function prioPunkte(todo) {
    if (todo.dringend && todo.wichtig)  return 1;
    if (todo.dringend && !todo.wichtig) return 2;
    if (!todo.dringend && todo.wichtig) return 3;
    return 4;
}

function berechnePrio(dringend, wichtig){
    if (dringend === true && wichtig === true){return 'Sofort erledigen';}
    else if (dringend === true && wichtig === false){return 'Gib es ab';}
    else if (dringend === false && wichtig === true){return 'Einplanen und Wohlfühlen';}
    else if (dringend === false && wichtig === false){return 'Weg damit';}
    else {return 'Keine Priorität';}
}


function modalAendernOeffnen(todo) {
    aktuelleEditId = todo.id;
    document.getElementById('editTitel').value       = todo.titel;
    document.getElementById('editArt').value         = todo.art;
    document.getElementById('editAutor').value       = todo.autor;
    document.getElementById('editKategorie').value   = todo.kategorie;
    document.getElementById('editBeschreibung').value = todo.beschreibung || '';
    document.getElementById('editWichtig').checked   = todo.wichtig;
    document.getElementById('editDringend').checked  = todo.dringend;
    document.getElementById('editStartdatum').value  = todo.startdatum || '';
    document.getElementById('editEnddatum').value    = todo.enddatum || '';
    document.getElementById('editFortschritt').value = todo.fortschritt || 0;
    overlay.classList.remove('hidden');
    modalAendern.classList.remove('hidden');
}

function todosAnzeigen(todoListe) {

    const todos = todoListe !== undefined 
        ? todoListe 
        : JSON.parse(localStorage.getItem('todos') || '[]');

    const container = document.querySelector('.linkscontent');
    container.innerHTML = '';

    if (todos.length === 0) {
        container.innerHTML = '<p style="color:#b2afaf; padding:1rem;">Keine Todos gefunden.</p>';
        return;
    }
    
    todos.forEach(function(todo) {
        const karte = document.createElement('div');
        karte.className = 'todo-karte';

        karte.innerHTML = `
            <div class="grid-container">
                <div class="upper-first-line">
                    <div class="first-line">
                        <h3 style="color: ${getcolor(todo.kategorie)};">${todo.kategorie}</h3>
                        <p id="type" style="background-color: ${getcolorofart(todo.art)};">${todo.art}</p>
                    </div>
                    <p id="prio" style="color: ${getcolorofprio(berechnePrio(todo.dringend, todo.wichtig))}">${berechnePrio(todo.dringend, todo.wichtig)}</p>
                </div>

                <p><strong>> ${todo.titel}</strong></p>
                <p>${todo.beschreibung || '<i>Keine Beschreibung gesetzt.</i>'}</p>
                <p>von: <b>${todo.autor}</p><br>

                <div class="fortschritt">
                    <p><b>${todo.fortschritt ? `${todo.fortschritt}` : '0'}</b>%</p>
                    <div class="fortschritt-balken">
                        <div class="fortschritt-fill" style="width:${todo.fortschritt}%;"></div>
                    </div>
                </div>

                <div class="bottom-card">
                    <p>${todo.startdatum ? `${todo.startdatum}` : 'tt.mm.jjjj'} - ${todo.enddatum ? `${todo.enddatum}` : 'tt.mm.jjjj'}</p>
                        <div class="bttn-card">
                            <button class="btn-update" data-id="${todo.id}">Ändern</button>
                            <button class="btn-loeschen" data-id="${todo.id}">Löschen</button>
                        </div>
                </div>
            </div>
        `;

        container.appendChild(karte);
        karte.querySelector('.btn-loeschen').addEventListener('click', function() {
            const id = Number(this.dataset.id);
            let todos = JSON.parse(localStorage.getItem('todos') || '[]');
            todos = todos.filter(t => t.id !== id);
            localStorage.setItem('todos', JSON.stringify(todos));
            todosAnzeigen();
        });
        karte.querySelector('.btn-update').addEventListener('click', function() {
            const id = Number(this.dataset.id);
            const todos = JSON.parse(localStorage.getItem('todos') || '[]');
            const todo = todos.find(t => t.id === id);
            if (todo) modalAendernOeffnen(todo);
        });
    });
}