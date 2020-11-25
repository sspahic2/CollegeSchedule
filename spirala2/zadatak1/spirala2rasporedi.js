function pozovi() {
    var okvir = document.getElementById("container1");
    iscrtajRaspored(okvir, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 8, 21);
    dodajAktivnost(okvir,"WT","predavanje",9,12,"Ponedjeljak");
    dodajAktivnost(okvir,"WT","vježbe",12,13.5,"Ponedjeljak");
    dodajAktivnost(okvir,"RMA","predavanje",14,17,"Ponedjeljak");
    dodajAktivnost(okvir,"RMA","vježbe",12.5,14,"Utorak");
    dodajAktivnost(okvir,"DM","tutorijal",14,16,"Utorak");
    dodajAktivnost(okvir,"DM","predavanje",16,19,"Utorak");
    dodajAktivnost(okvir,"OI","predavanje",12,15,"Srijeda");
    dodajAktivnost(okvir,"Mala","pauza",13,19,"Četvrtak");
    dodajAktivnost(okvir,"Mala","pauza",8,13,"Četvrtak");
    dodajAktivnost(okvir,"Mala","pauza",19,21,"Četvrtak");

    var okvir1 = document.getElementById("container2");
    iscrtajRaspored(okvir1, ["Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak"], 11, 22);
    dodajAktivnost(okvir1,"WT","predavanje",11,12,"Ponedjeljak");
    dodajAktivnost(okvir1,"WT","vježbe",12.5,14.5,"Ponedjeljak");
    dodajAktivnost(okvir1,"RMA","predavanje",16,17,"Ponedjeljak");
    dodajAktivnost(okvir1,"DM","tutorijal",15,18,"Utorak");
    dodajAktivnost(okvir1,"DM","predavanje",11,14,"Utorak");
    dodajAktivnost(okvir1,"RMA","vježbe",20,22,"Utorak");
    dodajAktivnost(okvir1,"OI","predavanje",11,22,"Srijeda");

    dodajAktivnost(okvir1,"IM1","ispit",11,13,"Petak");
    dodajAktivnost(okvir1,"IM2","ispit",13,15,"Petak");
    dodajAktivnost(okvir1,"IM3","ispit",15,17,"Petak");
    dodajAktivnost(okvir1,"DM","ispit",17,19,"Petak");
    dodajAktivnost(okvir1,"RPR","ispit",19,21,"Petak");
    dodajAktivnost(okvir1,"","pauza",21,21.5,"Petak");
    dodajAktivnost(okvir1,"RA","testić",21.5,22,"Petak");

}