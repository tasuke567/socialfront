import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  
  selector: 'app-interest-form',
  templateUrl: './interest-form.component.html',
  styleUrls: ['./interest-form.component.css']
})
export class InterestFormComponent implements OnInit {
  @Output() submitInterest = new EventEmitter<string[]>();
  @Output() cancel = new EventEmitter<void>();

  interestForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  // Define a list of available interests
  interests: string[] = [
    'Technology',
    'Sports',
    'Music',
    'Travel',
    'Food',
    'Art',
    'Fashion',
    'Gaming'
  ];

  constructor(private fb: FormBuilder) {
    this.interestForm = this.fb.group({
      selectedInterests: this.fb.array([], [Validators.required, Validators.minLength(3)])
    });
  }

  ngOnInit(): void {
    // Optionally initialize the FormArray with default values (false for each interest)
    // Or leave it empty and let the user check which ones they want
  }

  // Getter for selectedInterests FormArray
  get selectedInterests(): FormArray {
    return this.interestForm.get('selectedInterests') as FormArray;
  }

  // Toggle selection for an interest
  onCheckboxChange(interest: string, event: any) {
    if (event.target.checked) {
      this.selectedInterests.push(this.fb.control(interest));
    } else {
      const index = this.selectedInterests.controls.findIndex(x => x.value === interest);
      if (index !== -1) {
        this.selectedInterests.removeAt(index);
      }
    }
  }

  onSubmit(): void {
    if (this.interestForm.invalid) return;
    // Now the value will be an array of strings
    const selectedInterests = this.interestForm.value.selectedInterests;
    console.log('Selected interests:', selectedInterests);
    this.submitInterest.emit(selectedInterests);
  }
}
