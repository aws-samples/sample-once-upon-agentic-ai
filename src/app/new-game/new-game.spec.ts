import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGame } from './new-game';

describe('NewGame', () => {
  let component: NewGame;
  let fixture: ComponentFixture<NewGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
