import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacetrackComponent } from './facetrack.component';

describe('FacetrackComponent', () => {
  let component: FacetrackComponent;
  let fixture: ComponentFixture<FacetrackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
