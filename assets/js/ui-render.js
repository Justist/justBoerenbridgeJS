// APP RENDERING
// ============================================================================

function createNode(tag, options = {}, children = []) {
   const node = document.createElement(tag);
   const { attrs = {}, className, id, text } = options;

   if (id) {
      node.id = id;
   }
   if (className) {
      node.className = className;
   }
   if (text !== undefined) {
      node.textContent = text;
   }

   for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
         node.setAttribute(key, String(value));
      }
   }

   const childList = Array.isArray(children) ? children : [children];
   for (const child of childList) {
      if (child === undefined || child === null) {
         continue;
      }
      if (typeof child === "string") {
         node.appendChild(document.createTextNode(child));
      } else {
         node.appendChild(child);
      }
   }

   return node;
}

function createScreenShell(id, contentNode, hidden = true) {
   const screen = createNode("div", { id, className : `contact-clean${ hidden ? " hidden" : "" }` });
   screen.appendChild(contentNode);
   return screen;
}

function createActionButton(text, action, className = "btn btn-primary", id = undefined) {
   return createNode("button", {
      id,
      className,
      text,
      attrs : {
         "data-action" : action,
         "type"        : "button"
      }
   });
}

function createResponsiveSection(contentNode, { id = undefined, className = "" } = {}) {
   const extraClass = className ? ` ${ className }` : "";
   return createNode("div", { id, className : `table-responsive${ extraClass }` }, [contentNode]);
}

function createAlertBox(id, text, hidden = false) {
   return createNode("div", {
      id,
      className : `alert alert-success${ hidden ? " hidden" : "" }`,
      attrs     : { role : "alert" }
   }, [createNode("span", { text })]);
}

function renderSettingsScreen() {
   const clearTable = createNode("table", { id : "clearCookiesTable", className : "table" }, [
      createNode("thead", { className : "alignLeft" }, [
         createNode("tr", { className : "alignLeft" }, [
            createNode("th", { className : "alignLeft" }, [
               createActionButton("Verwijder opgeslagen gegevens",
                                  "clearLocalAndOverview",
                                  "btn clearCookiesButton",
                                  "clearCookiesButton")
            ])
         ])
      ])
   ]);

   const settingsTable = createNode("table", {
      id        : "settingsTable",
      className : "table alignCenter"
   });

   const saveTable = createNode("table", { id : "settingsButtonsTable", className : "table" }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Opslaan en terug naar overzicht",
                                  "applySettingsAndOverview",
                                  "btn btn-primary",
                                  "saveSettingsButton")
            ])
         ])
      ])
   ]);

   const form = createNode("form", { attrs : { method : "post" } }, [
      createScreenHeader("Instellingen", false),
      createNode("div", { className : "form-group" }, [
         createResponsiveSection(clearTable, { className : "alignCenter" }),
         createResponsiveSection(settingsTable),
         createResponsiveSection(saveTable, { className : "alignCenter" })
      ])
   ]);

   return createScreenShell("settingsScreen", form);
}

function renderGameRulesScreen() {
   const gameRulesText = createNode("p", {}, [
      createNode("strong", { text : "Korte speluitleg  " }),
      "Het doel van het spel is te voorspellen hoeveel slagen men in een bepaalde spelronde kan ",
      "behalen. Elke spelronde begint met het uitdelen van een gegeven hoeveelheid kaarten aan ",
      "iedere speler.",
      createNode("br"),
      "Iedere speler geeft aan hoeveel slagen hij of zij denkt te gaan winnen, te beginnen bij ",
      "de speler links van de deler. De hoogste bieder bepaalt de troef. ",
      "De persoon die als laatst moet zeggen hoeveel slagen hij haalt (de gever dus), mag niet ",
      "het aantal slagen zeggen die de som zou doen uitkomen (voorbeeld: in ronde 7 krijgt ",
      "ieder 7 kaarten. Speler 1 zegt dat hij geen slagen haalt, speler 2 zegt drie slagen en ",
      "speler 3 zegt twee slagen. Speler 4, die laatst zit, mag dus niet zeggen dat hij twee ",
      "slagen gaat halen, want 0+3+2+2=7).",
      createNode("br"),
      "In de eerste spelronde wordt er \u00e9\u00e9n kaart uitgedeeld aan iedere speler. In ",
      "de tweede ronde worden twee kaarten uitgedeeld aan iedere speler, in de derde spelronde ",
      "drie, enzovoort. Dit gaat door totdat er net voldoende kaarten zijn om het spel te laten ",
      "doorgaan (bijvoorbeeld met vijf spelers is het maximaal aantal uitgedeelde kaarten per ",
      "speler gelijk aan 10). Na de spelronde met het maximale aantal kaarten wordt er in de ",
      "volgende spelronden terug afgebouwd, tot de laatste ronde met \u00e9\u00e9n kaart ",
      "per speler. De speler met het hoogste aantal punten na de laatste ronde wint het spel.",
      createNode("br"),
      "De spelrichting is met de wijzers van de klok mee. Een speler is verplicht kleur te ",
      "bekennen, maar niet verplicht om een troef te spelen als hij de gevraagde kleur niet ",
      "heeft.",
      createNode("br"),
      "Optie:",
      createNode("br"),
      "Een extra tussenronde: Na de 10e ronde bij boerenbridge kan je nog een ronde spelen met ",
      "10 kaarten zonder troef. Daarna volgt nogmaals een ronde met 10 kaarten maar dan weer ",
      "met troef. Vervolgens wordt weer afgeteld naar 1 kaart."
   ]);

   const scoreText = createNode("p", {}, [
      createNode("strong", { text : "Puntentelling" }),
      createNode("br"),
      createNode("strong", { text : "Goed" }),
      ": Heb je na het einde van een ronde de juiste voorspelling, dan krijg je 10 punten. ",
      "Voor iedere slag die je hebt gewonnen krijg je 3 punten extra.",
      createNode("br"),
      createNode("strong", { text : "Fout" }),
      ": Zit je voorspelling ernaast, dan heb je 3 minpunten per kaart die je er naast zat. ",
      "Was je voorspelling dat je 4 slagen zou winnen, maar heb je er maar 2? Dan heb je ",
      "(4 - 2 ) x 3 = 6 minpunten."
   ]);

   const spadeText = createNode("p", {}, [
      createNode("strong", { text : "Schoppen troef? " }),
      "Dan worden alle behaalde of verloren punten verdubbeld!",
      createNode("br")
   ]);

   const buttonTable = createNode("table", { id : "gamerulesButtonTable", className : "table" }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Terug naar overzicht", "toOverview")
            ])
         ])
      ]),
      createNode("tbody")
   ]);

   const form = createNode("form", { attrs : { method : "post" } }, [
      createScreenHeader("Spelregels & telling", false),
      createNode("div", { className : "form-group" }, [
         gameRulesText,
         scoreText,
         spadeText,
         createResponsiveSection(buttonTable, { className : "alignCenter" })
      ])
   ]);

   return createScreenShell("gameRulesScreen", form);
}

function renderScoreboardScreen() {
   const currentDateLabel = new Date().toLocaleDateString("nl-NL");

   const continueTable = createNode("table", { className : "table" }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Verder spelen", "toBids")
            ])
         ])
      ])
   ]);

   const otherButtonsTable = createNode("table", { className : "table" }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Nieuw spel", "toNewGame")
            ]),
            createNode("th", {}, [
               createActionButton("Overzicht", "toOverview")
            ])
         ])
      ])
   ]);

   const form = createNode("form", { attrs : { method : "post" } }, [
      createScreenHeader("Stand"),
      createNode("p", {
         id        : "dateTimeScoreBoard",
         className : "alignCenter",
         text      : `Spel van ${ currentDateLabel }`
      }),
      createNode("div", { className : "form-group" }, [
         createResponsiveSection(createNode("table", { id : "scoreDataTable", className : "table alignCenter" })),
         createResponsiveSection(continueTable, { id : "scoreboardToBidButton", className : "alignCenter" }),
         createResponsiveSection(otherButtonsTable, {
            id        : "scoreboardToOtherButtons",
            className : "alignCenter hidden"
         })
      ])
   ]);

   return createScreenShell("scoreboardScreen", form);
}

function renderTakeScreen() {
   const infoTable = createNode("table", { className : "table" }, [
      createNode("tbody", {}, [
         createNode("tr", {}, [
            createNode("td", { className : "bidInfoRow" }, ["Totaal gehaald", createNode("br")]),
            createNode("td", { id : "takeInfoRow" }, ["0 / 1", createNode("br")])
         ])
      ])
   ]);

   const buttonsTable = createNode("table", { id : "takeScreenButtonsTable", className : "table" }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { id : "takeScreenToBidsButton", className : "alignCenter" }, [
               createActionButton("Naar Bieden", "storeTakesToBids")
            ]),
            createNode("th", {}, [
               createActionButton("Naar Score", "storeTakesToScores")
            ])
         ])
      ]),
      createNode("tbody")
   ]);

   const form = createNode("form", { id : "takeForm", attrs : { method : "post" } }, [
      createScreenHeader("Halen"),
      createNode("p", {
         id        : "takeScreenTopInfo",
         className : "alignCenter",
         text      : "Ronde X, Deler Y deelt Z kaarten"
      }),
      createNode("div", { className : "form-group" }, [
         createResponsiveSection(createNode("table", { id : "takeInputTable", className : "table aligncenter" })),
         createNode("p", { id : "spadeTrumpTakeScreen", className : "alignCenter" }, [
            createNode("strong", { text : "Schoppen wel / niet troef" }),
            createNode("br")
         ]),
         createResponsiveSection(infoTable),
         createAlertBox("takesEqualAlert",
                        "Aantal gehaalde slagen is ongelijk aan aantal te halen slagen!"),
         createAlertBox("takesFilledAlert",
                        "Nog niet alle gehaalde slagen zijn ingevoerd!",
                        true),
         createResponsiveSection(buttonsTable, { className : "alignCenter" })
      ])
   ]);

   return createScreenShell("takeScreen", form);
}

function renderOverviewScreen() {
   const buttonTable = createNode("table", { id : "overviewButtonsTable", className : "table" }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Nieuw spel", "toNewGame")
            ]),
            createNode("th", {}, [
               createActionButton("Regels & telling", "toGameRules")
            ]),
            createNode("th", {}, [
               createActionButton("Instellingen", "toSettings")
            ])
         ])
      ]),
      createNode("tbody")
   ]);

   const form = createNode("form", { attrs : { method : "post" } }, [
      createNode("h2", { className : "text-center", text : "Welkom bij Boerenbridge!" }),
      createNode("p", {}, [
         "Deze app is ontwikkeld door Aad Klaver en Simon Klaver en is bedoeld om scores voor ",
         "Boerenbridge in bij te houden. Onder deze tekst kunt u kiezen of u een nieuw spel wil ",
         "starten of eerst even de regels wil lezen.",
         createNode("br"),
         " Voordat u begint, wil ik wel nog even een paar woorden zeggen. En dit zijn ze: ",
         "Domkop! Blubber! Kleinood! Kriel! Dank u."
      ]),
      createResponsiveSection(buttonTable, { className : "alignCenter" })
   ]);

   return createScreenShell("overviewScreen", form);
}

function renderBidScreen() {
   const spadeLabel = createNode("label", { attrs : { for : "spadeRadioButton" } }, [
      createNode("strong", { text : "\u2660\u00a0" }),
      "troef",
      createNode("strong", { text : "\u00a0\u00a0" }),
      createNode("input", {
         id    : "spadeRadioButton",
         attrs : {
            type          : "radio",
            name          : "schoppenTroef",
            "data-action" : "clickSpadeRadioButton"
         }
      })
   ]);

   const otherLabel = createNode("label", { attrs : { for : "otherTrumpRadioButton" } }, [
      createNode("input", {
         id    : "otherTrumpRadioButton",
         attrs : {
            type          : "radio",
            name          : "schoppenTroef",
            "data-action" : "clickSpadeRadioButton"
         }
      }),
      "  Andere troef"
   ]);

   const infoTable = createNode("table", { className : "table" }, [
      createNode("thead", {}, [createNode("tr")]),
      createNode("tbody", {}, [
         createNode("tr", {}, [
            createNode("td", { className : "bidInfoRow" }, ["Totaal geboden", createNode("br")]),
            createNode("td", { id : "bidInfoRow" }, ["0 / 1", createNode("br")])
         ]),
         createNode("tr")
      ])
   ]);

   const buttonTable = createNode("table", {
      id        : "bidScreenButtonsTable",
      className : "table hidden"
   }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Naar Halen", "storeBids")
            ])
         ])
      ]),
      createNode("tbody")
   ]);

   const form = createNode("form", {
      id    : "bidForm",
      attrs : {
         method                : "post",
         "data-submit-action" : "storeBids"
      }
   }, [
      createScreenHeader("Bieden"),
      createNode("p", {
         id        : "bidScreenTopInfo",
         className : "alignCenter",
         text      : "Ronde X, Deler Y deelt Z kaarten"
      }),
      createNode("p", { id : "spadeRadioButtonsP", className : "alignCenter" }, [
         spadeLabel,
         "    ",
         otherLabel,
         createNode("br")
      ]),
      createNode("p", {
         id        : "middleRoundText",
         className : "alignCenter",
         text      : "Deze ronde is er geen troef!"
      }),
      createNode("div", { className : "form-group" }, [
         createResponsiveSection(createNode("table", { id : "bidInputTable", className : "table alignCenter" })),
         createResponsiveSection(infoTable),
         createAlertBox("spadeTrumpSelectAlert", "Je moet aangeven welke kleur troef is!"),
         createAlertBox("bidsEqualAlert",
                        "Aantal geboden slagen mag niet gelijk zijn aan aantal te halen slagen!",
                        true),
         createAlertBox("bidsFilledAlert", "Nog niet iedereen heeft geboden!"),
         createResponsiveSection(buttonTable, { className : "alignCenter" })
      ])
   ]);

   return createScreenShell("bidScreen", form);
}

function renderNewGameScreen() {
   const debugDiv = createNode("div", {
      id        : "debugSetMaxCardsDiv",
      className : "form-check alignCenter hidden"
   }, [
      createNode("label", {
         className : "form-check-label",
         attrs     : { for : "debugSetMaxCardsInput" },
         text      : "Max kaarten:"
      }),
      createNode("br"),
      createNode("input", {
         id        : "debugSetMaxCardsInput",
         className : "form-check-input alignCenter",
         attrs     : {
            type  : "number",
            value : "2"
         }
      }),
      createNode("br")
   ]);

   const startTable = createNode("table", {
      id        : "newGameButtonTable",
      className : "table hidden"
   }, [
      createNode("thead", { className : "alignCenter" }, [
         createNode("tr", { className : "alignCenter" }, [
            createNode("th", { className : "alignCenter" }, [
               createActionButton("Start 1e ronde", "storePlayers")
            ])
         ])
      ])
   ]);

   const form = createNode("form", {
      id    : "newGameForm",
      attrs : { method : "post" }
   }, [
      createScreenHeader("Nieuw spel"),
      createNode("div", { className : "form-group nameForm" }, [
         createResponsiveSection(createNode("table", {
            id        : "newGameInputTable",
            className : "table nameTable"
         }), { className : "nameTableDiv" }),
         debugDiv,
         createAlertBox("notEnoughPlayersAlert", "Te weinig spelers ingevoerd!"),
         createAlertBox("doublePlayerNamesAlert", "Dubbele namen zijn niet toegestaan!", true),
         createAlertBox("noValidDealerAlert", "Geen (valide) beginspeler aangeklikt!"),
         createResponsiveSection(startTable, { className : "alignCenter" })
      ])
   ]);

   return createScreenShell("newGameScreen", form);
}

function renderAppShell() {
   const app = document.getElementById("app");
   if (! app) {
      throw new Error("App mount point #app not found");
   }

   clearElement(app);
   const screens = [
      renderSettingsScreen(),
      renderGameRulesScreen(),
      renderScoreboardScreen(),
      renderTakeScreen(),
      renderOverviewScreen(),
      renderBidScreen(),
      renderNewGameScreen()
   ];

   for (const screenNode of screens) {
      if (screenNode instanceof Node) {
         app.appendChild(screenNode);
      }
   }

   return true;
}
