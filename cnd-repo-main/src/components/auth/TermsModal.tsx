import { X } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export default function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-black">Terms</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-gray-700">
          <p>
            OPŠTE ODREDBE


1.1. Aplikaciju upravlja i održava ugostiteljski objekat „Prekoputa“, registrovan u Republici Srbiji (u daljem tekstu: „Prekoputa“ ili „Pružalac usluge“).
1.2. Ovi Uslovi predstavljaju pravno obavezujući ugovor između korisnika Aplikacije (u daljem tekstu: „Korisnik“) i „Prekoputa“.
1.3. Aplikacija služi isključivo za vođenje programa lojalnosti i nagrađivanja kupaca „Prekoputa“.
USLOVI ZA KORIŠĆENJE I REGISTRACIJA


2.1. Korišćenje Aplikacije je dozvoljeno svim licima, bez ograničenja minimalne starosne dobi.
2.2. Radi korišćenja Aplikacije, Korisnik je dužan da kreira korisnički nalog unosom tačnih i potpunih podataka, uključujući ime i adresu elektronske pošte.
2.3. Jedan Korisnik može imati više korisničkih naloga, pod uslovom da se svaki nalog registruje sa različitom adresom elektronske pošte.
2.4. Korisnik je odgovoran za čuvanje pristupnih podataka svog naloga i snosi punu odgovornost za sve aktivnosti izvršene putem svog naloga.
PROGRAM LOJALNOSTI I TOKENI


3.1. Korisnici ostvaruju tokene prilikom kupovine proizvoda u objektu „Prekoputa“, prema važećem odnosu:
 100 RSD potrošenog iznosa = 10 tokena.
3.2. Tokeni se dodaju na korisnički nalog ručnim unosom od strane osoblja „Prekoputa“, na osnovu jednokratnog koda koji Korisnik generiše i saopštava osoblju.
3.3. Tokeni se mogu koristiti isključivo za ostvarivanje nagrada u vidu besplatnih proizvoda iz ponude „Prekoputa“, u skladu sa pravilima programa lojalnosti važećim u trenutku korišćenja.
3.4. Tokeni se ne mogu prenositi između korisnika, ne mogu se zameniti za novac i nemaju novčanu protivvrednost.
3.5. Maksimalan broj tokena koje jedan korisnički nalog može imati iznosi 800 tokena.
3.6. Tokeni trenutno nemaju rok važenja, ali „Prekoputa“ zadržava pravo da u budućnosti uvede ograničenje trajanja tokena.
3.7. „Prekoputa“ zadržava pravo da u svakom trenutku izmeni pravila programa lojalnosti, uključujući odnos sticanja tokena, vrste nagrada i potreban broj tokena za njihovo ostvarivanje.
PLAĆANJA I KUPOVINE


4.1. Aplikacija ne omogućava plaćanje proizvoda. Sve kupovine i plaćanja vrše se isključivo u fizičkom objektu „Prekoputa“.
4.2. Aplikacija ne prikazuje cene proizvoda i ne učestvuje u formiranju ili naplati cena.
4.3. Eventualne reklamacije, povraćaji ili druga potrošačka prava ostvaruju se direktno u objektu „Prekoputa“, u skladu sa važećim zakonima Republike Srbije.
ZLOUPOTREBA I UKIDANJE TOKENA


5.1. U slučaju sumnje na zloupotrebu Aplikacije, nepravilno korišćenje tokena ili pokušaj prevare, „Prekoputa“ zadržava pravo da privremeno ili trajno oduzme tokene sa korisničkog naloga.
5.2. Odluke donete u vezi sa zloupotrebom programa lojalnosti smatraju se konačnim.
ZAŠTITA PODATAKA O LIČNOSTI


6.1. Prilikom registracije i korišćenja Aplikacije prikupljaju se sledeći podaci: ime, adresa elektronske pošte i istorija kupovina.
6.2. Lozinke i autentifikacioni podaci čuvaju se putem treće strane – tehničkog provajdera sistema, pri čemu „Prekoputa“ nema pristup korisničkim lozinkama.
6.3. Podaci o ličnosti obrađuju se u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije.
6.4. Korisnici mogu primati obaveštenja i promotivne poruke putem elektronske pošte ili notifikacija, uz mogućnost odjave marketinških poruka.
6.5. Detalji o obradi podataka o ličnosti dostupni su u Politici privatnosti, koja čini sastavni deo ovih Uslova.
NOTIFIKACIJE


7.1. Aplikacija može slati notifikacije korisnicima koji su je instalirali kao web aplikaciju.
7.2. Marketinške notifikacije su opcionog karaktera i Korisnik može u svakom trenutku povući saglasnost za njihov prijem.
ODGOVORNOST I DOSTUPNOST APLIKACIJE


8.1. „Prekoputa“ ne garantuje da će Aplikacija uvek biti dostupna bez prekida ili tehničkih grešaka.
8.2. „Prekoputa“ ne snosi odgovornost za štetu nastalu usled privremene nedostupnosti Aplikacije, tehničkih problema ili gubitka podataka, osim u slučaju namere ili grube nepažnje.
8.3. „Prekoputa“ zadržava pravo da odbije pružanje usluge ili dodelu nagrade u izuzetnim slučajevima.
PRESTANAK KORIŠĆENJA I IZMENE USLOVA


9.1. Korisnik može u svakom trenutku prestati sa korišćenjem Aplikacije bez ikakvih posledica.
9.2. „Prekoputa“ zadržava pravo da trajno ili privremeno ukine Aplikaciju ili program lojalnosti.
9.3. Izmene Uslova biće dostavljene korisnicima putem elektronske pošte.
MERODAVNO PRAVO I REŠAVANJE SPOROVA


10.1. Na ove Uslove primenjuje se pravo Republike Srbije.
10.2. Strane će eventualne sporove pokušati da reše mirnim putem.
10.3. U slučaju da mirno rešavanje nije moguće, nadležan je stvarno nadležni sud u Beogradu.


          </p>
        </div>
      </div>
    </div>
  );
}
