import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDialog } from './settings-dialog';

describe('SettingsDialog', () => {
  let component: SettingsDialog;
  let fixture: ComponentFixture<SettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
