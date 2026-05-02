-- Update CV for Nguyen Van A (profile_id 101) with a permanent public PDF for testing
UPDATE CV 
SET File_path = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
WHERE profile_id = 101;
