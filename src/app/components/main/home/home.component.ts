import { Component, OnInit, OnDestroy } from "@angular/core";
import { DiningService } from 'src/app/services/dining.service';
import { Subscription } from 'rxjs';
import { OpenDining } from 'src/app/models/opendining';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit, OnDestroy {
  
  private diningListener: Subscription;
  openList: OpenDining[];
  closedList: String[];
  diningArray = [
    "1bowl",
    "earhart",
    "ford",
    "hillenbrand",
    "wiley",
    "windsor",
    "pete's za"
  ];
  

  //this has to be updated by backend for correctness
  // could maybe use tuples or dictionary for implementation?
  doc = [
    true,
    false,
    true,
    true,
    false,
    true,
    false
  ];

  constructor(
    private diningService: DiningService
  ) {
    //calls this on refresh
    //this.diningService.checkOpenClosed();
    this.diningService.getMealTime();

  }

  ngOnInit() {
    this.diningListener = this.diningService
          .getopenEmitter()
          .subscribe((respond: OpenDining[]) => {
            this.openList = respond;
            this.openList.forEach(openddc => {
              //console.log(openddc.closedTime.substring(11, 16));
              openddc.closedTime = openddc.closedTime.substring(11, 16);
            });
            //console.log(this.openList);
          });
    this.diningListener = this.diningService
          .getclosedEmitter()
          .subscribe(respond => {
            this.closedList = respond;
            //console.log(this.closedList);
          });
  }

  ngOnDestroy(){
    this.diningListener.unsubscribe();
  }

}


