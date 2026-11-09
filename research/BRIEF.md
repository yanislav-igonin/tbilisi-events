# Research brief: extra events in Tbilisi, 14–22 Nov 2026

Context: Yan (Russian speaker, ~31, lives in Dubai) is in Tbilisi 14–22 Nov 2026 for a week. Today is 9 Nov 2026.
He already has a list of 45 mainstream events (theatre, classical, big concerts) in `../events.json` — do NOT repeat those (check titles there).
Evening of 20 Nov (Thursday) is busy: Kreator + Overkill at Spacehall.

What he wants now — small, local, non-touristy things, mostly evenings:
- Small-stage rock / metal / punk / post-rock gigs, jams, open-mics in clubs (e.g. Mechanic, Dedaena, Bassiani-adjacent venues, Vinyl, Kiwi, Drama bar, Fabrika, Ezo, Tbilisi underground bars). Blues/jazz jams also welcome.
- Community lectures, talks, meetups, quiz nights, film screenings, standup in Russian/English.
- Unusual excursions/walks: format like "Batumi through the eyes of an engineer" — architecture, Soviet modernism, engineering, industrial heritage, hidden courtyards, food/wine, author tours. Russian-language guides are a plus.
- Expat / Russian-speaking community events (Telegram channels, Russian-language event sites, Facebook groups, Instagram venue posters).

Sources to try: venue Instagram/Facebook/Telegram, tkt.ge, biletebi.ge, yolo.ge, eventebi.ge, events.tbiliseli.com, Russian-language Telegram channels about Tbilisi afisha (t.me/s/<channel> gives a web preview), relocant/expat sites, tripster/sputnik8 for excursions, meetup.com, Resident Advisor.

Rules:
- Only things you actually found evidence for. Never invent dates, times or prices. If a regular weekly event (e.g. "jam every Tuesday") — give the concrete dates that fall into 14–22 Nov and mark `"recurring": true` with the source of the schedule.
- Excursions that run on request/any day: date = null, put in the list anyway with how to book.
- Russian descriptions, short (1–2 sentences).

Output: write a JSON array to the file path given in your task, items shaped like:
{"date":"2026-11-17"|null,"time":"20:00"|null,"title":"","category":"rock|metal|punk|jazz|blues|jam|lecture|meetup|excursion|film|standup|quiz|party|other","venue":"","address":"","price":"","language":"","description":"","url":"","source":"where you found it","status":"confirmed|recurring|on_request|unverified","notes":""}
Then reply with a 5-line summary: how many found, best 3 picks, sources that were dead ends.
