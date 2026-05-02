-- Update CV for Nguyen Van A (profile_id 101) with a permanent public PDF that allows iframes
UPDATE CV 
SET File_path = 'https://pdfobject.com/pdf/sample-3pp.pdf' 
WHERE profile_id = 101;
