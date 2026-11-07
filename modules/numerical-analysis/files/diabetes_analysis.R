
# ============================================================
# DIABETES DATA ANALYSIS
# ============================================================

# Document all analysis steps and learning using # comments.
# These comments will help with the presentation and final reflection.


# ============================================================
# SET UP AND IMPORT THE DATA
# ============================================================

# Tell R which folder contains the CSV file.
# Use forward slashes in a Windows folder path.
# Change this path to the folder that contains the CSV file.
# Set the working directory to the folder that contains the CSV file, for example with setwd().


# Import the CSV and store it as an R object named diab.

diab <- read.csv("akshaydattatraykhare-diabetes-dataset.csv")


# Check how much data was imported.
# The first number is the number of rows. The second is the number of columns.

dim(diab)


# Inspect the structure, variable names, data types, and example values.

str(diab)


# ============================================================
# HASHMARK STOP: AFTER IMPORTING THE DATA
# ============================================================

# CHECK: Expected 768 rows and 9 variables; dim(diab) returned 768 rows
# and 9 variables.

# PROBLEM: I ran dim(diab) before importing the CSV and received the error
# "object 'diab' not found." I had set the working directory, but I had not
# yet created an R object named diab.

# FIX: I imported the CSV with
# diab <- read.csv("akshaydattatraykhare-diabetes-dataset.csv")
# and then ran dim(diab) again. I verified the fix when diab appeared in the
# Global Environment and dim(diab) returned 768 rows and 9 columns.

# EVIDENCE: The Global Environment showed diab as a data frame, and dim(diab)
# confirmed that the imported data contained 768 participant records and
# 9 variables.

# ADAPTED: The earlier COVID script created a small dataset by typing values
# directly into data.frame(). For this assignment, I used read.csv() to
# import 768 participant records from an external CSV file.

# REFLECTION: I have forgotten this a few times. Using setwd() only tells R
# where to look for files. It does not automatically open the CSV or create
# a dataset object. The read.csv() command imports the file, while <- stores
# the imported data under the object name diab.


# ============================================================
# INSPECT THE RAW DATA BEFORE CALCULATING STATISTICS
# ============================================================

# Inspect the range and distribution of values in each variable.
# Look for unusual minimums, maximums, and values that may not make sense.

summary(diab)


# Count the zero values in every variable before cleaning.
# This provides the before-cleaning counts used to verify the recoding.

colSums(diab == 0)


# UNEXPECTED OUTPUT: The summary showed zero values for BMI, SkinThickness,
# Insulin, BloodPressure, and Glucose. These did not make sense as genuine
# clinical measurements because values such as BMI or blood pressure cannot
# realistically be zero.

# ASSUMPTION QUESTIONED: I initially assumed that every number in the
# imported dataset was a recorded measurement. The impossible zeros suggest
# that zero was sometimes used to represent a measurement that was not
# recorded.

# DECISION: I will keep zero where it has a genuine meaning, including zero
# pregnancies and Outcome = 0. A participant can have zero pregnancies, and
# Outcome = 0 means the woman remained diabetes-free. Outcome records onset
# of diabetes within five years among women without diabetes at baseline
# (Smith et al., 1988). I will recode impossible zeros in the five
# clinical measurement variables as missing values.

# LIMITATION: Recoding the impossible zeros as missing means that later
# analyses may use different sample sizes, depending on which variables
# are required.


# ============================================================
# CLEAN THE IMPOSSIBLE ZEROS
# ============================================================

# Zero is not a realistic clinical measurement for these five variables.
# Store their names so the same cleaning rule can be applied to each one.

zero_is_missing <- c(
  "Glucose",
  "BloodPressure",
  "SkinThickness",
  "Insulin",
  "BMI"
)


# Use a loop to replace the impossible zeros with NA in all five variables.
# NA tells R that the measurement was not recorded.

for (v in zero_is_missing) {
  diab[[v]][diab[[v]] == 0] <- NA
}


# Count all missing values in the cleaned dataset.

colSums(is.na(diab))


# Confirm that no impossible zeros remain in the five cleaned variables.
# Each variable should return zero.

colSums(diab[zero_is_missing] == 0, na.rm = TRUE)


# Count the NA values in the five cleaned variables.
# These counts should match the impossible-zero counts found before cleaning.

colSums(is.na(diab[zero_is_missing]))

# CHECK: I did not assume that the loop worked because it produced
# no error. I counted the remaining zeros and resulting NA values to verify
# that the intended values had been changed.

# DECISION: I used a loop to apply the same cleaning rule to Glucose,
# BloodPressure, SkinThickness, Insulin, and BMI. The loop processed each
# variable name stored in zero_is_missing and changed its zero values to NA.

# REFLECTION: Before this step, I might have written five separate cleaning
# commands. The loop showed me how R can repeat one consistent action across
# several variables, reducing repeated code and the risk of treating one
# variable differently by mistake.


# Calculate the percentage of missing values in every variable.

round(colMeans(is.na(diab)) * 100, 1)


# Check whether Insulin is missing at different rates for women who
# remained diabetes-free, Outcome = 0, and women who developed diabetes
# within five years, Outcome = 1.

round(
  tapply(is.na(diab$Insulin), diab$Outcome, mean) * 100,
  1
)


# Count participants with recorded values for all nine variables.

sum(complete.cases(diab))


# ============================================================
# AFTER CLEANING AND CHECKING MISSING DATA
# ============================================================

# RESULT: After recoding, 374 Insulin measurements were recorded as NA,
# representing 48.7% of the sample.

# UNEXPECTED OUTPUT: I expected some Insulin measurements to be missing,
# but I did not expect the missingness to affect 374 participants, or
# 48.7% of the sample.

# RESULT: Insulin was missing for 47.2% of women who remained diabetes-free
# and 51.5% of women who developed diabetes within five years.

# ASSUMPTION QUESTIONED: Missing Insulin measurements were common in both
# outcome groups, but the rate was 4.3 percentage points higher among
# women who developed diabetes. I cannot assume that missingness was
# identical across the two groups.

# LIMITATION: The dataset shows which Insulin measurements were not recorded,
# but it does not explain why they were missing. The 4.3 percentage-point
# difference also does not establish that missingness differed significantly
# between the groups. It does match the missingness-depends-on-outcome
# pattern in Hughes et al. (2019), Figure 1F.

# RESULT: Only 392 of the 768 participants had recorded values for all
# nine variables.

# ALTERNATIVES: I considered removing every participant with any missing
# measurement. This would reduce the dataset from 768 participants to only
# 392 complete records and would discard other usable information.

# ALTERNATIVES: I also considered imputing the missing measurements, which
# means replacing them with estimated values. However, 374 Insulin
# measurements are missing, so almost half of that variable would need to
# be estimated. This would require a carefully justified imputation method.

# DECISION: I will use the available complete observations needed for each
# individual analysis rather than deleting every incomplete participant
# or automatically estimating the missing values.

# REPORTING CHANGE: Because different analyses require different variables,
# the valid sample size may change. I will report the actual n used for each
# result rather than implying that every analysis uses all 768 participants.

# REFLECTION: This process showed me that identifying missing values is only
# the beginning of a missing-data analysis. I also need to compare defensible
# ways of handling the missingness, investigate whether it follows a pattern,
# and explain how the chosen approach changes the sample size available for
# later analyses.

# ADAPTED: I used AI as a diagnostic and organizational support tool. The AI
# review identified that my cleaning analysis did not yet include the
# deletion, imputation, and analysis-specific complete-case alternatives. It
# also identified the missing-by-Outcome check and helped me determine where
# each new code block and reflection comment belonged.

# FIX: I returned to the cleaning section, ran the additional
# missing-by-Outcome check, verified the 47.2% and 51.5% missingness rates,
# and used the existing complete-case output of 392 to compare the
# missing-data alternatives. I then reorganized the section so that each
# command is followed by the result and reasoning that came from it.

# DECISION: I did not accept the AI suggestions without checking them. I ran
# the code in R, verified the numerical outputs, and retained only the
# comments that accurately represented my actual reasoning and experience.

# REFLECTION: AI was most useful when I used it to review the completeness
# and organization of my work rather than to make the statistical decisions
# for me. The final responsibility remained with me to run the code,
# understand the output, verify the numbers, and decide what belonged in
# the analysis.

# ============================================================
# COMPARE THE RAW AND CLEANED MEANS
# ============================================================

# Compare the original and cleaned means to determine whether impossible
# zeros incorrectly lowered the averages for Glucose, BloodPressure, and BMI.

raw <- read.csv("akshaydattatraykhare-diabetes-dataset.csv")

round(rbind(
  raw_with_zeros = sapply(
    raw[c("Glucose", "BloodPressure", "BMI")],
    mean
  ),
  zeros_removed = sapply(
    diab[c("Glucose", "BloodPressure", "BMI")],
    mean,
    na.rm = TRUE
  )
), 2)


# ============================================================
# AFTER COMPARING THE RAW AND CLEANED MEANS
# ============================================================

# RESULT: Mean Glucose increased from 120.89 to 121.69 mg/dL after
# the five impossible Glucose zeros were treated as missing. This was
# an increase of 0.80 mg/dL.

# RESULT: Mean BloodPressure increased from 69.11 to 72.41 mm Hg after
# the 35 impossible blood-pressure zeros were treated as missing. This
# was an increase of 3.30 mm Hg, or approximately 4.8%.

# RESULT: Mean BMI increased from 31.99 to 32.46 kg/m^2 after the 11
# impossible BMI zeros were treated as missing. This was an increase
# of 0.47 kg/m^2.

# UNEXPECTED OUTPUT: I expected the cleaned means to increase, but I did
# not expect the blood-pressure mean to increase by 3.30 mm Hg.

# INTERPRETATION: Cleaning did not affect every variable equally. Glucose
# changed very little because it contained only five impossible zeros.
# BloodPressure contained 35 impossible zeros and showed the largest change
# among the three means.

# REPORTING CHANGE: I will report the cleaned means because the raw means
# treated unrecorded measurements as genuine zeros and therefore lowered
# the calculated averages.

# REFLECTION: I learned that data cleaning can materially change a
# statistical result. A value can be accepted as numeric by R while still
# being invalid in the real-world context of the dataset.


# Data is cleaned. now I need more readable outcomes to better understand the data

diab$OutcomeF <- factor(diab$Outcome, levels = c(0, 1),
                        labels = c("No diabetes", "Diabetes"))
table(diab$OutcomeF)
nrow(diab)
round(prop.table(table(diab$OutcomeF)) * 100, 1)
# RESULT: 268 of 768 women developed diabetes within five years (34.9%).
# INTERPRETATION: The class distribution matters when I look at accuracy 
# and how it is evaluated later.
# PRESENTATION: Use both count and percentage. Allows stronger clarity.
# So, the sample contains 768 women, and 268 (34.9%) of them developed diabetes 
# within five years or about a third of the women.

# next to check for age
summary(diab$Age)
quantile(diab$Age, c(0.10, 0.90))
sum(diab$Age < 30) / nrow(diab) * 100
# PROBLEM: I saw that the median age was 29 and started to think this could
# support a relationship between the number of pregnancies and diabetes.
# However, the age summary only tells me the ages of the women in the sample.
# It does not compare Pregnancies with Outcome regardless of the dots I'm trying to connect.

# FIX: I corrected my interpretation. These age results cannot show whether
# pregnancy count and diabetes are related. I need a separate analysis that
# compares Pregnancies with Outcome before I can claim there is a relationship.
# Age may also need to be considered because it could be related to both the
# number of pregnancies and diabetes.

# ============================================================
# BUILDING OUT THE DATA TO GRAPHS 
# ============================================================

#Create histogram for distribution of ages
hist(diab$Age, breaks = seq(20, 85, by = 5), col = "grey80", border = "white",
     main = "Age distribution (n = 768)", xlab = "Age (years)", ylab = "Number of women")
abline(v = median(diab$Age), lty = 2)
# RESULT: The mean age was 33.2 years, the median age was 29 years, and
# 51.6% of the women were under 30. The youngest participant was 21, so
# this was an adult-only sample.

# INTERPRETATION: The age distribution was right-skewed. Most women were
# concentrated at younger ages, while fewer older women created a longer
# tail to the right.

# CHECK: The histogram matched the numerical age results. The longer tail
# at older ages is consistent with the mean age of 33.2 being higher than
# the median age of 29.

# check actual pregnancies
diab$EverPregnant <- ifelse(diab$Pregnancies == 0, "Never pregnant", "Pregnant at least once")
table(diab$EverPregnant)
round(prop.table(table(diab$EverPregnant)) * 100, 1)
mode(diab$Age)
# PROBLEM: I used mode() because the assignment asked for the mode, which
# I understood to mean the most common value. Instead, R returned "numeric."

# FIX: I remember the module explained that mode() tells me the type of data 
# stored in the variable.
# It does not calculate the statistical mode. To find the most common value,
# I need to count how often each value occurs and find the highest count.

# Base R has no statistical mode, so write one. It returns every tied value.
stat_mode <- function(x) {
  x <- x[!is.na(x)]
  counts <- table(x)
  as.numeric(names(counts)[counts == max(counts)])
}
stat_mode(diab$Age)
stat_mode(diab$BMI)
stat_mode(diab$Glucose)
stat_mode(diab$BloodPressure)
stat_mode(diab$Pregnancies)
#note tie on glucose with 99 and 100. 
# Important: Lean on median instead. Mode is Weaker.

# Table all of it
describe <- function(x) {
  x <- x[!is.na(x)]
  c(n = length(x), mean = mean(x), median = median(x),
    mode = stat_mode(x)[1], min = min(x), max = max(x),
    range = max(x) - min(x), sd = sd(x))
}

desc <- rbind(
  Age              = describe(diab$Age),
  BMI              = describe(diab$BMI),
  Glucose          = describe(diab$Glucose),
  BloodPressure    = describe(diab$BloodPressure),
  Pregnancies_all  = describe(diab$Pregnancies),
  Pregnancies_ever = describe(diab$Pregnancies[diab$Pregnancies > 0])
)
round(desc, 2)
# Display the descriptive-statistics table rounded to two decimal places.

# Save the rounded table as a CSV file in the working folder.
write.csv(round(desc, 2), "descriptives_table.csv")
# RESULT: I saved the required statistics in a table that included the
# number of usable values for each variable.

# REPORTING CHANGE: I will report a separate n for each variable because
# the number of missing values differs across variables.

# EVIDENCE: I saved the descriptive-statistics table as
# descriptives_table.csv. I also verified that each range was calculated
# correctly as the maximum minus the minimum. For example, the Age range
# was 60 years because 81 minus 21 equals 60.

# ALTERNATIVES: I realized that "applicable individuals" could be interpreted
# in two ways: all 768 women or only the 657 women who had at least one
# pregnancy. I reported both rows because the full-sample row
# answers the question for the entire dataset, while the ever-pregnant row
# answers the narrower interpretation.

# building more graphs
par(mfrow = c(2, 3))
hist(diab$Age, col = "grey80", border = "white", main = "Age", xlab = "years")
hist(diab$BMI, col = "grey80", border = "white", main = "BMI", xlab = "kg/m2")
hist(diab$Glucose, col = "grey80", border = "white", main = "Glucose", xlab = "mg/dL")
hist(diab$BloodPressure, col = "grey80", border = "white", main = "Diastolic BP", xlab = "mm Hg")
barplot(table(diab$Pregnancies), col = "grey80", border = "white",
        main = "Pregnancies", xlab = "number of pregnancies")
hist(diab$Insulin, col = "grey80", border = "white", main = "Insulin", xlab = "mu U/ml")
par(mfrow = c(1, 1))
# PROBLEM: I created the six-graph layout but forgot to reset the Plots pane
# afterward. This caused later graphs to continue using the smaller multi-plot
# layout.

# FIX: I ran par(mfrow = c(1, 1)) after creating the six graphs. This reset
# the Plots pane so future graphs will display one at a time.
par(mfrow = c(1, 5), mar = c(4, 4, 3, 1))
boxplot(Age ~ OutcomeF, data = diab, main = "Age", xlab = "", ylab = "years", col = c("grey85", "grey60"))
boxplot(BMI ~ OutcomeF, data = diab, main = "BMI", xlab = "", ylab = "kg/m2", col = c("grey85", "grey60"))
boxplot(Glucose ~ OutcomeF, data = diab, main = "Glucose", xlab = "", ylab = "mg/dL", col = c("grey85", "grey60"))
boxplot(BloodPressure ~ OutcomeF, data = diab, main = "Diastolic BP", xlab = "", ylab = "mm Hg", col = c("grey85", "grey60"))
boxplot(Pregnancies ~ OutcomeF, data = diab, main = "Pregnancies", xlab = "", ylab = "count", col = c("grey85", "grey60"))
par(mfrow = c(1, 1), mar = c(5, 4, 4, 2) + 0.1)
# Glucose shows the clearest separation. The lower quartile for women who
# developed diabetes sits near the median for women who remained
# diabetes-free. BMI, Age and Pregnancies all run higher in the group that
# developed diabetes. Blood pressure differs least. The sections from
# "GLUCOSE: DEVELOPED DIABETES VS REMAINED DIABETES FREE" to "Model 1 vs Model 2" test whether
# these visible differences hold up statistically.

# ============================================================
# OUTLIERS AND UNUSUAL VALUES 
# ============================================================
# DECISION: I will use the IQR rule to identify unusually high or low values
# for further checking, not to automatically remove them as errors.
# ALTERNATIVES: For a value flagged by the IQR rule, I could keep it, check
# it more closely, transform the variable, or remove the value only if I
# could verify that it was an error.
# ASSUMPTION QUESTIONED: An extreme value is not automatically a data error.
# REPORTING CHANGE: Describe unusual but plausible values instead of labelling all flags as errors.

iqr_flags <- function(x) {
  q <- quantile(x, c(0.25, 0.75), na.rm = TRUE)
  fence <- 1.5 * IQR(x, na.rm = TRUE)
  sum(x < q[1] - fence | x > q[2] + fence, na.rm = TRUE)
}
num_vars <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
              "Insulin", "BMI", "DiabetesPedigreeFunction", "Age")
sapply(diab[num_vars], iqr_flags)

#First, I identified how many unusual values exist. 
# Next, look at the actual values before deciding whether they are 
#possible measurements or potential errors.
sort(diab$BloodPressure)[1:5]
sort(diab$BMI, decreasing = TRUE)[1:5]
sort(diab$SkinThickness, decreasing = TRUE)[1:3]
diab[diab$Pregnancies >= 14, c("Pregnancies", "Age")]

# RESULT: The IQR rule flagged values in most variables. Two values were
# doubtful: a skinfold of 99 mm when the next highest was 63, and a
# diastolic pressure of 24 mm Hg. A BMI of 67.1 and 15 to 17 pregnancies
# were extreme but possible.

# DECISION: I kept all observations because I had no source records to
# prove any value was an error, and named the two doubtful values in the
# presentation.

# ============================================================
# DIABETES RATES BY GROUPS 
# ============================================================

table(cut(diab$Age, breaks = c(-Inf, 30, 40, 50, Inf)))
sum(diab$Age == 30)
#Number check as things do not line up
table(cut(
  diab$Age,
  breaks = c(-Inf, 30, 40, 50, Inf),
  right = FALSE
))

diab$AgeGroup <- cut(
  diab$Age,
  breaks = c(-Inf, 30, 40, 50, Inf),
  right = FALSE,
  labels = c("<30", "30-39", "40-49", "50+")
)

diab$BMIcat <- cut(
  diab$BMI,
  breaks = c(-Inf, 18.5, 25, 30, Inf),
  right = FALSE,
  labels = c("Underweight", "Normal", "Overweight", "Obese")
)

diab$PregGroup <- cut(
  diab$Pregnancies,
  breaks = c(-Inf, 1, 3, 5, Inf),
  right = FALSE,
  labels = c("0", "1-2", "3-4", "5+")
)

table(diab$AgeGroup)

# PROBLEM: My first cut() command used the default boundary rule, which
# included women aged exactly 30 in the first group. This did not match my
# earlier result for women under 30.

# FIX: I added right = FALSE so women aged 30 were placed in the 30-39
# group instead of the under-30 group.

# ADAPTED: The first command helped me understand how right = FALSE places
# age 30 in the 30-39 group rather than the under-30 group. I then adapted
# the code by adding labels and storing the result as diab$AgeGroup.

# REFLECTION: I learned that code can display a correct result without saving
# it. Using table(cut(...)) showed the age-group counts, but using
# diab$AgeGroup <- cut(...) created a variable that I can use again later.

rate_table <- function(group) {
  tab <- table(group, diab$OutcomeF)
  cbind(tab, n = rowSums(tab),
        pct_diabetes = round(prop.table(tab, 1)[, "Diabetes"] * 100, 1))
}
rate_table(diab$AgeGroup)

# RESULT: The percentage developing diabetes was 21.2% under 30, 46.1% at
# 30-39, 55.1% at 40-49 and 48.3% at 50+. The rate rose sharply but not
# steadily, and group sizes differed (396 under 30, 89 aged 50+).

rate_table(diab$BMIcat)
sum(is.na(diab$BMIcat))

# RESULT: The percentage with diabetes increased across the BMI categories:
# 0.0% for Underweight, 6.9% for Normal, 22.3% for Overweight, and 46.4%
# for Obese.

# LIMITATION: The Underweight group contained only four women, so its 0.0%
# diabetes rate is based on too few participants for a strong conclusion.
# The BMI table used 757 women because 11 BMI values were missing.

# INTERPRETATION: The table suggests an association between higher BMI
# categories and a higher percentage with diabetes in this sample. However,
# this table alone does not calculate a correlation, test whether the
# association is statistically significant, or show that BMI caused diabetes.

# REFLECTION: I was not surprised to see a higher percentage with diabetes
# in the Overweight and Obese groups, but I learned that an expected pattern
# still needs to be statistically tested before I make a firm claim.
rate_table(diab$PregGroup)
tapply(diab$Age, diab$PregGroup, median)

# RESULT: The percentage developing diabetes was 34.2% for 0 pregnancies,
# 20.2% for 1-2, 35.0% for 3-4 and 47.8% for 5+.
#Reporting Change: Dropped the planned "risk rises with every pregnancy" sentence; 
#reported the 5+ group's higher rate instead.

#Graphs from new tables
par(mfrow = c(1, 3), mar = c(7.5, 4, 3, 1))
for (g in c("AgeGroup", "BMIcat", "PregGroup")) {
  pct <- prop.table(table(diab[[g]], diab$Outcome), 1)[, "1"] * 100
  bp <- barplot(pct, ylim = c(0, 70), col = "grey65", border = "white",
                ylab = "% developing diabetes", las = 2,
                main = c(AgeGroup = "Age group", BMIcat = "BMI category",
                         PregGroup = "Pregnancies")[g])
  text(bp, pct + 4, round(pct, 1), cex = 0.9)
}
par(mfrow = c(1, 1), mar = c(5, 4, 4, 2) + 0.1)

# ============================================================
# GLUCOSE: DEVELOPED DIABETES VS REMAINED DIABETES FREE 
# ============================================================

# Describe Glucose separately for the two Outcome groups.
tapply(
  diab$Glucose,
  diab$OutcomeF,
  function(x) round(c(
    n = sum(!is.na(x)),
    mean = mean(x, na.rm = TRUE),
    sd = sd(x, na.rm = TRUE),
    median = median(x, na.rm = TRUE)
  ), 1)
)

# Check whether Glucose is normally distributed in each Outcome group.
tapply(
  diab$Glucose,
  diab$OutcomeF,
  function(x) shapiro.test(x)$p.value
)

# Compare the mean Glucose levels using the Welch t-test.
t.test(Glucose ~ OutcomeF, data = diab)

# Calculate Cohen's d to measure the size of the mean difference.
g0 <- na.omit(diab$Glucose[diab$Outcome == 0])
g1 <- na.omit(diab$Glucose[diab$Outcome == 1])

sp <- sqrt(
  ((length(g0) - 1) * var(g0) +
     (length(g1) - 1) * var(g1)) /
    (length(g0) + length(g1) - 2)
)

(mean(g1) - mean(g0)) / sp

# Use Mann-Whitney as a second comparison based on ranks.
wilcox.test(Glucose ~ OutcomeF, data = diab)

# DECISION: I used the Mann-Whitney test as a second check because the
# Glucose values were not normally distributed. The test compares the
# ordering of Glucose values between the two independent Outcome groups
# without relying as strongly on the normality assumption.

# CHECK: The Welch t-test compared the mean Glucose levels, while the
# Mann-Whitney test checked whether Glucose values generally tended to be
# higher in one Outcome group. I used both tests to see whether they
# supported the same overall conclusion.

# RESULT: Outcome 0 mean = 110.6 mg/dL; Outcome 1 mean = 142.3 mg/dL;
# difference = 31.7 mg/dL; 95% CI 27.5 to 35.9; p < .001;
# effect size d = 1.19.

# REPORTING CHANGE: I will report the size of the difference and its
# uncertainty, rather than reporting only that the result was statistically
# significant.

# LIMITATION: This comparison is based on observational data, so it shows
# an association between Glucose and diabetes Outcome but does not establish
# that higher Glucose caused diabetes.

# ============================================================
# PREGNANCIES: DEVELOPED DIABETES VS REMAINED DIABETES FREE 
# ============================================================

tapply(diab$Pregnancies, diab$OutcomeF, function(x) c(mean = round(mean(x), 2), median = median(x),
                                                      IQR = IQR(x)))
wilcox.test(Pregnancies ~ OutcomeF, data = diab)
t.test(Pregnancies ~ OutcomeF, data = diab)$p.value
t.test(Pregnancies ~ OutcomeF, data = diab)

# DECISION: Pregnancies is a count. It is right skewed and has many ties, 
# so a mean difference is less meaningful here than it is for glucose. 
# I made Mann-Whitney the main test and reported medians (2 vs 4). 
# The t-test agrees, which strengthens the result.

# RESULT: Women who developed diabetes had higher pregnancy counts, with a median of
# 4 pregnancies and an IQR of 6.25, compared with a median of 2 and an IQR
# of 4 among women who remained diabetes-free. The Mann-Whitney test returned
# W = 50985, p < .001.

# CHECK: The Welch t-test also returned p < .001, so both tests supported
# the conclusion that pregnancy counts differed between the Outcome groups.

# LIMITATION: This comparison shows an association, not causation. Age may
# be related to both pregnancy count and diabetes Outcome.

# Create a boxplot comparing pregnancy counts between the Outcome groups.
boxplot(
  Pregnancies ~ OutcomeF,
  data = diab,
  col = c("grey80", "grey60"),
  border = "black",
  main = "Pregnancy counts by diabetes outcome",
  xlab = "Diabetes outcome",
  ylab = "Number of pregnancies"
)

# CHECK: The boxplot matched the numerical results. The Diabetes group had
# a higher median pregnancy count and a wider IQR than the No diabetes group.

# ============================================================
# CORRELATION MATRIX 
# ============================================================

round(cor(diab[num_vars]), 2)
# The first table contained many NA values. The correlations were not
# calculated, which does not mean that the correlations were zero.

cor_p <- cor(
  diab[num_vars],
  use = "pairwise.complete.obs",
  method = "pearson"
)

round(cor_p, 2)

# UNEXPECTED OUTPUT: My first correlation matrix showed many NA values
# instead of correlations.

# PROBLEM: cor() could not calculate most of the correlations because the
# cleaned variables contained missing values.

# ALTERNATIVES: I could use only rows with complete data for every variable,
# or use the available complete pairs for each correlation.

# FIX: I used pairwise.complete.obs so each correlation used the participants
# who had values for both variables being compared. I also checked how many
# participants were used for selected comparisons.

# REFLECTION: I learned that code can run without an error but still not
# produce the results I need. After cleaning the data, I must tell R how
# to handle the missing values.

# ADAPTED: The COVID script called cor() separately for each pair. With eight
# variables, there are 28 different pairs. Passing all eight columns to cor()
# returns every pair in one matrix. The trade off is that pairwise-complete
# correlations can use different sample sizes, so I created a count matrix
# to check how many women were used for each comparison.

# How many women sit behind each correlation?
pair_n <- crossprod(!is.na(diab[num_vars]))
pair_n[c("Glucose", "Insulin", "Age"), c("Glucose", "Insulin", "Age")]

cor_s <- cor(
  diab[num_vars],
  use = "pairwise.complete.obs",
  method = "spearman"
)
round(c(pearson = cor_p["Glucose", "Insulin"],
        spearman = cor_s["Glucose", "Insulin"]), 2)

# CHECK: I created both the Pearson and Spearman correlation matrices before
# displaying their Glucose rows. The results matched my earlier output.

# ASSUMPTION QUESTIONED: I questioned which variables should count as
# continuous. Pregnancies is a discrete count rather than a measurement on
# a continuous scale, and Outcome is binary.

# DECISION: I left Outcome out because it is the outcome variable for later
# analysis. I kept Pregnancies in the correlation matrix but noted that it
# is a count variable.

# ALTERNATIVES: I calculated both Pearson and Spearman correlations because
# several variables were skewed and contained unusual values.

# RESULT: The Glucose-Insulin correlation was 0.58 with Pearson and 0.66
# with Spearman, based on 393 women with both measurements.

# INTERPRETATION: Both methods showed a positive relationship between
# Glucose and Insulin. The higher Spearman value suggests that the ranked
# values followed each other somewhat more closely than the original values
# followed a straight-line relationship.

# LIMITATION: The difference between Pearson and Spearman does not by itself
# prove that the relationship is non-linear. A scatterplot would be needed
# to examine the shape of the relationship.

cor.test(diab$Glucose, diab$Insulin)
cor.test(diab$BMI, diab$SkinThickness)$estimate
# QUESTION: Are Age and Pregnancies related strongly enough that they may
# contain some overlapping information?

# DECISION: I used a Pearson correlation to measure the direction and
# strength of the relationship between Age and Pregnancies.

# CHECK: This test examines whether Age and Pregnancies are related to each
# other. It does not test whether either variable independently predicts
# diabetes.

cor.test(diab$Age, diab$Pregnancies)

# RESULT: Age and Pregnancies had a moderate positive correlation,
# r = .54.

# INTERPRETATION: In this dataset, higher Age tended to occur with a higher
# number of Pregnancies. The variables therefore contain some overlapping
# information, although they do not measure the same thing.

# LIMITATION: This correlation does not show that Age caused a higher number
# of Pregnancies. It also does not determine which variable is a better
# independent predictor of diabetes.

# REFLECTION: This relationship may become important in a later regression
# model because including two related predictors can change how much unique
# information each predictor contributes.

#Heatmap
labs <- c("Preg", "Gluc", "BP", "Skin", "Ins", "BMI", "DPF", "Age")
image(1:8, 1:8, cor_p[, 8:1], col = hcl.colors(20, "Blue-Red 3", rev = TRUE),
      zlim = c(-1, 1), axes = FALSE, xlab = "", ylab = "",
      main = "Pearson correlations (pairwise complete)")
axis(1, 1:8, labs, las = 2); axis(2, 1:8, rev(labs), las = 1)
text(rep(1:8, 8), rep(8:1, each = 8), sprintf("%.2f", cor_p), cex = 0.8,
     col = ifelse(abs(cor_p) > 0.6, "white", "black"))

# RESULT: Most correlations were weak (|r| < 0.30). Three were moderate to
# strong: SkinThickness with BMI (r = 0.65), Glucose with Insulin
# (r = 0.58, 95% CI 0.51 to 0.64, n = 393, p < .001), and Age with
# Pregnancies (r = 0.54).

# INTERPRETATION: Among the possible predictors, Glucose otherwise had weak
# correlations with the numerical variables, with the largest being its
# correlation with Age (r = 0.27).

# ============================================================
# AGE GROUP AND BMI CATEGORY 
# ============================================================

# DECISION: I used chi-square because I am comparing counts across categories.
# Both diabetes Outcome and the age and BMI groups are categorical variables.
# Chi-square tests whether the pattern of diabetes counts differs across the
# categories more than would be expected by chance.

tab_age <- table(diab$AgeGroup, diab$OutcomeF)
chi_age <- chisq.test(tab_age)
chi_age
round(chi_age$expected, 1)
# CHECK: Every expected count was above 5, so the chi-square condition was met.

tab_bmi <- table(diab$BMIcat, diab$OutcomeF)
chi_bmi <- chisq.test(tab_bmi)
chi_bmi
round(chi_bmi$expected, 1)
# UNEXPECTED OUTPUT: I initially thought all expected counts were above 5,
# but the expected counts in the Underweight row were only 2.6 and 1.4.

# REFLECTION: The chi-square test matched the type of variables and question,
# but I learned that choosing the right kind of test is not enough. I also
# need to check whether its conditions are met.

# ALTERNATIVES: Because the Underweight group produced expected counts below
# 5, I could use Fisher's exact test on the original four-category table or
# combine the small Underweight group with the adjacent Normal group and
# rerun the chi-square test.

# DECISION: I will use the merged three-category BMI
# comparison as the main chi-square analysis. I will use Fisher's exact test
# on the original four-category table as a check that the overall conclusion
# does not depend on how I handled the small Underweight category.

# REPORTING CHANGE: I will not rely on the original four-category chi-square
# p-value because its expected-count condition was not fully met.

# Option A: exact test on the original four categories
fisher.test(tab_bmi)$p.value

# Option B: merge Underweight into Normal ("Not overweight") and rerun
diab$BMIcat3 <- factor(ifelse(diab$BMIcat %in% c("Underweight", "Normal"), "Not overweight",
                              as.character(diab$BMIcat)),
                       levels = c("Not overweight", "Overweight", "Obese"))
tab_bmi3 <- table(diab$BMIcat3, diab$OutcomeF)
chisq.test(tab_bmi3)

# DECISION: The chi-square tests show whether diabetes Outcome is associated
# with age group or BMI category, but the p-values do not show how strong
# those associations are. I calculated Cramer's V as an effect-size measure
# for categorical variables.

# REPORTING CHANGE: I will report both the chi-square result and Cramer's V
# so that I describe statistical significance and the strength of each
# association.

# CHECK: For BMI, I calculated Cramer's V from the revised three-category
# table because that is the BMI table used for the main chi-square analysis
cramers_v <- function(tab) {
  chi <- suppressWarnings(chisq.test(tab, correct = FALSE))$statistic
  as.numeric(sqrt(chi / (sum(tab) * (min(dim(tab)) - 1))))
}
round(c(age = cramers_v(tab_age), bmi_3cat = cramers_v(tab_bmi3)), 3)
# REPORTING CHANGE: I will report the BMI association using the revised
# three-category BMI variable rather than the original four categories.
# The write-up will explain that I combined Underweight with Normal because
# the Underweight group produced expected counts below 5.

# REPORTING CHANGE: I will report Fisher's exact test on the original
# four-category BMI table as a check. Fisher's test also found evidence of
# an association between BMI category and diabetes Outcome, p < .001.

#There was evidence of an association between diabetes status and age group,
# χ²(3, N = 768) = 69.92, p < .001, Cramér’s V = 0.30. Diabetes status was also
# associated with the revised three-category BMI variable, χ²(2, N = 757) = 76.98, 
# p < .001, Cramér’s V = 0.32. Underweight was combined with Normal because the 
# small Underweight group produced expected counts below 5 in the original table. 
# Fisher’s exact test on the original four-category table also found evidence of
# a BMI association, p < .001.

# ============================================================
# GLUCOSE ACROSS AGE GROUPS 
# ============================================================
# DECISION: I used a one-way ANOVA because I am comparing mean Glucose
# across four age groups. A t-test works for two groups, but ANOVA lets me
# compare all four groups in one test.

# INTERPRETATION: The ANOVA will tell me whether at least one age group has
# a different mean Glucose level. It will not tell me which groups differ,
# so I may need a follow-up test if the overall result is significant.

round(tapply(diab$Glucose, diab$AgeGroup, mean, na.rm = TRUE), 1)
round(tapply(diab$Glucose, diab$AgeGroup, sd, na.rm = TRUE), 1)

fit_aov <- aov(Glucose ~ AgeGroup, data = diab)
summary(fit_aov)

# Levene's test (median-centred, the same calculation as car::leveneTest)
dev <- abs(diab$Glucose - ave(diab$Glucose, diab$AgeGroup,
                              FUN = function(x) median(x, na.rm = TRUE)))
anova(lm(dev ~ diab$AgeGroup))
# ASSUMPTION QUESTIONED: The standard ANOVA assumes that Glucose has a
# reasonably similar amount of variation across the four age groups. I
# checked the group standard deviations and used a median-centred Levene
# test rather than assuming that the spreads were equal.

# RESULT: The median-centred Levene test indicated that Glucose variability
# differed across the age groups, F(3, 759) = 2.95, p = .032.

# ALTERNATIVES: I considered ordinary ANOVA, Welch ANOVA, and the
# rank-based Kruskal-Wallis test.

# DECISION: I selected Welch ANOVA as the main test because the Levene test
# indicated unequal variances. I will use ordinary ANOVA and Kruskal-Wallis
# as checks to see whether the overall conclusion changes with a different
# method.

oneway.test(Glucose ~ AgeGroup, data = diab)
kruskal.test(Glucose ~ AgeGroup, data = diab)
# RESULT: Welch ANOVA found evidence that mean Glucose differed across the
# four age groups, Welch's F(3, 247.59) = 20.25, p < .001.

# CHECK: The Kruskal-Wallis test also found evidence that Glucose differed
# across the age groups, chi-squared(3) = 59.04, p < .001. The rank-based
# test supported the same overall conclusion as Welch ANOVA.

# INTERPRETATION: These overall tests show that Glucose differed somewhere
# across the four age groups. They do not yet show which specific age groups
# differed from each other.

# CHECK: I need a follow-up method that is suitable for unequal variances
# before naming specific differences between age groups.

# REPORTING CHANGE: For now, I will report only the overall difference
# across the four age groups. I will not name specific pairwise differences
# unless I complete a follow-up test designed for unequal variances.

# ADAPTED: I found a follow-up method that matches my decision to use Welch
# ANOVA. The pairwise tests use separate estimates of variation rather than
# assuming equal variances, and Holm adjustment accounts for the six
# comparisons.

pairwise.t.test(
  diab$Glucose,
  diab$AgeGroup,
  pool.sd = FALSE,
  p.adjust.method = "holm"
)
# RESULT: Welch pairwise t-tests with Holm adjustment showed that mean
# glucose differed significantly between most age groups. The exception
# was the 30-39 group (mean = 126.1) and the 40-49 group (mean = 125.7),
# which did not differ significantly from each other. The <30 group
# (mean = 114.6) was significantly lower than the middle groups, and the
# 50+ group (mean = 139.6) was significantly higher than all others.

# INTERPRETATION: Mean glucose rose with age in this sample, apart from a
# plateau between the 30-39 and 40-49 groups, and was highest in the
# 50+ group.

# PROBLEM: My first attempt did not include the final closing parenthesis.
# The Console was still waiting for the rest of the command when I sent the
# block again, which caused an "unexpected symbol" error.

# FIX: I pressed Esc to cancel the incomplete Console command, highlighted
# the complete pairwise.t.test() block including the closing parenthesis,
# and ran it again with Ctrl + Enter.

# ============================================================
# MULTIPLE LINEAR REGRESSION 
# ============================================================
# QUESTION: Which variables are associated with Glucose when several
# predictors are examined at the same time?

# DECISION: Earlier analyses examined one relationship at a time using
# correlations, t-tests, chi-square tests, and ANOVA. Multiple linear
# regression allows me to evaluate several predictors together in a
# single model.

# INTERPRETATION: The model estimates the relationship between Glucose
# and each predictor while holding the other predictors constant.

# ASSUMPTION QUESTIONED: A variable that appears important on its own may
# become less important after other related predictors are included in
# the model.

# LIMITATION: This is an observational dataset. Regression can identify
# statistical associations but cannot establish cause-and-effect
# relationships.

# ADAPTED: The COVID assignment from our last seminar introduced linear
# regression and used simple regression with one predictor, and I extended it to seven. 
# I applied the same modelling approach here, using Glucose as the response
# variable and the clinical measurements as predictors.

mlr <- lm(Glucose ~ Age + BMI + Pregnancies + BloodPressure + SkinThickness +
            Insulin + DiabetesPedigreeFunction, data = diab)
s_mlr <- summary(mlr)
s_mlr

# ADAPTED: The COVID seminar example used
# lm(Deaths ~ TotalConfirmed). Here I adapted the same approach by using
# lm(Glucose ~ seven predictors).

# ADAPTED: I reused the same model-summary workflow from the COVID script.
# The interpretation still focuses on model fit, explained variation, and
# overall model significance, even though the variables are different.

# ADAPTED: The COVID example focused on a single predictor coefficient.
# This model contains seven predictors, so the coefficient table becomes
# more important because each predictor must be interpreted while the
# others are held constant.

# ADAPTED: I added nobs() because missing values cause this model to use
# fewer observations than the original dataset. This was less important in
# the COVID example because there were no rows removed from the analysis.

# CHECK: I will verify the sample size used by the model, the R-squared,
# adjusted R-squared, F statistic, degrees of freedom, and overall
# p-value against summary(mlr).

# Same extraction pattern as the COVID script, now for seven predictors
nobs(mlr)
round(c(R2 = s_mlr$r.squared, adj_R2 = s_mlr$adj.r.squared), 3)
f <- s_mlr$fstatistic
pf(f[1], f[2], f[3], lower.tail = FALSE)

# Standardised coefficients: which predictor matters most, in SD units?
mlr_z <- lm(scale(Glucose) ~ scale(Age) + scale(BMI) + scale(Pregnancies) +
              scale(BloodPressure) + scale(SkinThickness) + scale(Insulin) +
              scale(DiabetesPedigreeFunction),
            data = diab[complete.cases(diab[num_vars]), ])
round(sort(abs(coef(mlr_z)[-1]), decreasing = TRUE), 3)

# RESULT:
# The model used 392 women with complete data.

# RESULT:
# The overall regression model was statistically significant.

# RESULT:
# Insulin had the largest standardized coefficient
# (beta = 0.513), followed by Age (beta = 0.191).

# REPORTING CHANGE:
# I will not interpret the smallest p-value as meaning
# "most important." Predictor importance is based on the
# standardized coefficients because they are on the same scale.

# ASSUMPTION QUESTIONED:
# Insulin was the strongest predictor, but Insulin and Glucose
# were measured during the same glucose-tolerance test.
# Elevated glucose produces an insulin response, so Insulin may
# be acting as a parallel measurement rather than an independent
# risk factor.

# LIMITATION:
# Part of the model's explanatory power may reflect the normal
# physiological relationship between Glucose and Insulin rather
# than independent prediction.

# ALTERNATIVES:
# I compared the full model with a model excluding Insulin and
# SkinThickness because these variables account for many of the
# missing-data exclusions.

# DECISION:
# I will use a sensitivity analysis to examine whether the main
# findings change when those predictors are removed.

# Sensitivity model: drop the two predictors that cost half the sample
mlr_b <- lm(Glucose ~ Age + BMI + Pregnancies + BloodPressure + DiabetesPedigreeFunction,
            data = diab)
nobs(mlr_b)
round(summary(mlr_b)$coefficients, 4)
round(c(R2 = summary(mlr_b)$r.squared, adj_R2 = summary(mlr_b)$adj.r.squared), 3)

# REPORTING CHANGE: I will report both the seven-predictor model
# (n = 392, R-squared = 0.401) and the reduced sensitivity model
# (n = 724, R-squared = 0.135).

# REPORTING CHANGE: Most of the explained variation in the full model
# appears to be driven by Insulin, which was measured during the same
# glucose-tolerance test as Glucose.

# REPORTING CHANGE: The sensitivity model retained substantially more
# women. Age, BMI, BloodPressure, and DiabetesPedigreeFunction were
# significant in the larger-sample model.

# INTERPRETATION: The full model explains more variation in Glucose, but
# it excludes 376 women because of missing data. The reduced model
# explains less variation but is based on a much larger sample.

# CHECK: Age, BMI, BloodPressure, and DiabetesPedigreeFunction remained
# significant in the reduced model. Pregnancies was not significant
# (p = .706).

# ASSUMPTION QUESTIONED: Multiple linear regression assumes a roughly
# linear relationship between the predictors and Glucose and that the
# residuals behave reasonably well.

# CHECK: I will inspect the standard regression diagnostic plots for
# evidence of strong non-linearity, unequal spread, unusual residuals,
# or influential observations.
par(mfrow = c(2, 2))
plot(mlr)
par(mfrow = c(1, 1))

# ASSUMPTION QUESTIONED: I expected the standard diagnostic plots to show
# few problems, but several plots suggested that the regression
# assumptions were only approximately satisfied.

# RESULT: The Residuals vs Fitted plot showed some curvature at higher
# fitted values.

# RESULT: The Normal Q-Q plot suggested that the residuals were not
# perfectly normal.

# RESULT: The Scale-Location plot suggested a slight increase in
# residual spread at higher fitted values.

# LIMITATION: These patterns do not invalidate the model, but they
# suggest that the assumptions were only approximately met.

# REPORTING CHANGE: I will interpret the coefficients primarily as
# descriptive associations and treat the p-values as approximate rather
# than exact.

# CHECK: The Residuals vs Leverage plot showed a small number of
# potentially influential observations, but there was no evidence that
# a single case completely dominated the model.

# ============================================================
# LOGISTIC REGRESSION AND GOODNESS OF FIT 
# ============================================================

# QUESTION: Which variables help predict whether a participant develops 
# diabetes within five years?

# DECISION: The Outcome variable contains only two values
# (0 = remained diabetes-free, 1 = developed diabetes within five years). 
# Because the outcome is binary, logistic regression is more appropriate than 
# linear regression.

# ADAPTED: The previous section used lm() to predict a continuous
# Glucose value. This section uses glm(..., family = binomial) to model
# the probability of diabetes.

# INTERPRETATION: Logistic regression estimates how BMI, Age, and
# Glucose are associated with the odds of diabetes.

# ASSUMPTION QUESTIONED: The coefficients are reported on the log-odds
# scale, so they cannot be interpreted in the same way as the linear
# regression coefficients from the previous section.

# CHECK: I will first verify that the logistic regression model runs
# successfully before examining predicted probabilities, goodness-of-fit,
# or classification accuracy.
logit1 <- glm(Outcome ~ BMI + Age + Glucose, family = binomial, data = diab)
summary(logit1)
round(cbind(OR = exp(coef(logit1)), exp(confint.default(logit1))), 3)

# Odds ratios per clinically sensible step rather than per single unit
round(exp(coef(logit1)[c("BMI", "Age", "Glucose")] * c(5, 10, 20)), 2)

# RESULT: A 5-unit increase in BMI multiplied the odds of developing
# diabetes by 1.57, a 10-year increase in Age by 1.33, and a 20 mg/dL
# increase in Glucose by 2.04, holding the other predictors constant.

# INTERPRETATION: In plain terms, about 57% higher odds per 5 BMI units,
# about 33% higher per 10 years of age, and roughly double the odds per
# 20 mg/dL of glucose.

# ASSUMPTION QUESTIONED: The odds ratios from logistic regression are
# reported for one-unit increases. For Age and Glucose, a one-unit
# change is very small and can make the effect size difficult to
# interpret.

# DECISION: I calculated odds ratios for larger changes in BMI, Age,
# and Glucose so the results would be easier to explain and compare.

# INTERPRETATION: This changes the unit used for reporting but does not
# change the underlying logistic regression model.

# LIMITATION: The model does not identify a single correct reporting
# increment. Different step sizes could reasonably be used.

#diab$prob <- fitted(logit1)
nrow(diab)
length(fitted(logit1))
# PROBLEM: Assigning fitted(logit1) to diab$prob returned a length-
# mismatch error because the logistic regression did not use all 768
# women in the dataset.

# ASSUMPTION QUESTIONED: I assumed the model generated one prediction
# for every row in diab.

# CHECK: fitted() returns predictions only for the observations
# actually used by the logistic regression model.

# REFLECTION: I learned that missing values can cause different analyses
# to use different sample sizes even when they are built from the same
# dataset.

diab$prob <- predict(logit1, newdata = diab, type = "response")
sum(is.na(diab$prob))
# FIX: I switched to predict(logit1, newdata = diab,
# type = "response"), which returned one prediction per row and
# inserted NA where a woman could not be scored because of missing
# predictor values.

# ASSIGNMENT: Evaluate goodness of fit using the required
# Hosmer-Lemeshow test.

# INTERPRETATION: This test compares the number of diabetes cases
# predicted by the model with the number actually observed.

# ASSUMPTION QUESTIONED: A logistic regression can have significant
# predictors but still fit the data poorly.

# CHECK: I will record the Hosmer-Lemeshow statistic, degrees of
# freedom, and p-value.

# LIMITATION: A non-significant result does not prove perfect fit. It
# only suggests that there is no evidence of poor fit.

# Hosmer-Lemeshow test (same method as ResourceSelection::hoslem.test, g = 10)
hosmer_lemeshow <- function(y, p, g = 10) {
  bins  <- cut(p, breaks = quantile(p, probs = seq(0, 1, 1 / g)), include.lowest = TRUE)
  obs   <- xtabs(cbind(1 - y, y) ~ bins)
  expct <- xtabs(cbind(1 - p, p) ~ bins)
  chi   <- sum((obs - expct)^2 / expct)
  c(X2 = chi, df = g - 2, p = pchisq(chi, g - 2, lower.tail = FALSE))
}
ok <- !is.na(diab$prob)
round(hosmer_lemeshow(diab$Outcome[ok], diab$prob[ok]), 4)
# RESULT: Hosmer-Lemeshow test:
# X-squared = 11.08, df = 8, p = .197.

# INTERPRETATION: The test found no evidence of poor fit between the
# predicted probabilities and the observed diabetes outcomes.

# CHECK: Because the p-value was greater than .05, I did not reject the
# null hypothesis that the model fits the data adequately.

# LIMITATION: A non-significant Hosmer-Lemeshow result does not prove
# perfect model fit. It only suggests that there is no evidence of poor
# fit based on this test.

classify <- function(p, y, cut = 0.5) {
  pred <- factor(ifelse(p >= cut, 1, 0), levels = c(0, 1))
  tab  <- table(Predicted = pred, Actual = y)
  print(tab)
  round(c(accuracy    = sum(diag(tab)) / sum(tab),
          sensitivity = tab["1", "1"] / sum(tab[, "1"]),
          specificity = tab["0", "0"] / sum(tab[, "0"])), 3)
}
classify(diab$prob[ok], diab$Outcome[ok], cut = 0.5)
# RESULT: Accuracy = 77.0%; sensitivity = 56.8%;
# specificity = 87.9%.

# INTERPRETATION: The model correctly classified 77.0% of women overall.

# ASSUMPTION QUESTIONED: Accuracy alone may not describe model
# performance completely because it does not distinguish between missed
# diabetes cases and false positives.

# REPORTING CHANGE: I will report sensitivity and specificity alongside
# accuracy rather than relying on accuracy alone.

# What accuracy would "predict nobody has diabetes" achieve?
round(mean(diab$Outcome[ok] == 0), 3)

# RESULT: Accuracy = 77.0%; sensitivity = 56.8%;
# specificity = 87.9%; majority baseline = 64.9%.

# UNEXPECTED OUTPUT: The 77.0% accuracy initially appeared strong, but
# predicting "no diabetes" for everyone would already achieve 64.9%
# accuracy.

# ASSUMPTION QUESTIONED: Overall accuracy alone can hide important
# weaknesses in a classification model.

# INTERPRETATION: The model improved on the majority baseline, but it
# still missed 43.2% of women who went on to develop diabetes.

# REPORTING CHANGE: I will report sensitivity, specificity, the
# classification threshold, and the baseline accuracy alongside the
# overall accuracy.

# REFLECTION: My understanding of model performance changed because
# accuracy must be interpreted alongside sensitivity, specificity, and
# an appropriate baseline comparison.

# ALTERNATIVES: The standard classification cut-off is 0.50, but a
# lower threshold may detect more diabetes cases at the cost of more
# false positive classifications.

# DECISION: I will compare a 0.35 cut-off with the standard 0.50
# cut-off to examine the sensitivity-specificity trade-off.
classify(diab$prob[ok], diab$Outcome[ok], cut = 0.35)

# ALTERNATIVES: I compared classification cut-offs of 0.50 and 0.35.

# RESULT: Lowering the cut-off from 0.50 to 0.35 increased sensitivity
# from 56.8% to 68.6%.

# RESULT: The increase in sensitivity came at the cost of lower
# specificity, which fell from 87.9% to 76.8%.

# INTERPRETATION: The lower cut-off identified more women who actually
# went on to develop diabetes, but it also produced more false positive
# classifications.

# REPORTING CHANGE: I will report the 0.50 cut-off as the primary
# classification result and the 0.35 cut-off as an illustration of the
# sensitivity-specificity trade-off.

# REFLECTION: I learned that changing the classification threshold does
# not change the logistic regression model itself. It changes how the
# predicted probabilities are converted into diabetes classifications.

# ============================================================
# BMI AND AGE INTERACTION EFFECTS 
# ============================================================

# QUESTION: Does the relationship between BMI and diabetes differ
# across age groups?

# DECISION: The previous logistic model assumed that BMI and Age have
# independent effects. An interaction model allows the BMI effect to
# change with Age.

# INTERPRETATION: A significant interaction would suggest that the
# effect of BMI on diabetes risk is different for younger and older
# women.

# ASSUMPTION QUESTIONED: I cannot assume that BMI has the same
# relationship with diabetes at every age without testing the
# interaction.

# CHECK: I will compare a main-effects model with an interaction model
# using a likelihood-ratio test.

# CHECK: Fit the raw model first; record BMI, Age, and interaction p-values before centring.

logit_int <- glm(Outcome ~ BMI * Age + Glucose, family = binomial, data = diab)
round(summary(logit_int)$coefficients, 4)
anova(logit1, logit_int, test = "Chisq")
#It looks as though BMI stopped mattering.
#age 0 and BMI 0, which are impossible values. The coefficients are describing 
# an imaginary woman.This is a zero-reference problem

# ASSUMPTION QUESTIONED: I initially expected the BMI coefficient to
# have a similar interpretation to the main-effects model.

# UNEXPECTED OUTPUT: After adding the BMI × Age interaction, the BMI
# and Age coefficients were no longer statistically significant
# (BMI p = .417; Age p = .562).

# INTERPRETATION: This does not necessarily mean that BMI and Age no
# longer matter. The interaction model changes the meaning of the
# lower-order coefficients.

# REFLECTION: I learned that interaction models change the meaning of
# the main-effect coefficients. A coefficient that appears to change or
# lose significance may reflect a different reference point rather than
# a weaker relationship.

# Centre BMI and Age so each main effect is read at the average of the other
diab$BMI_c <- diab$BMI - mean(diab$BMI, na.rm = TRUE)
diab$Age_c <- diab$Age - mean(diab$Age)
logit_int_c <- glm(Outcome ~ BMI_c * Age_c + Glucose, family = binomial, data = diab)
round(summary(logit_int_c)$coefficients, 4)
#DECISION: Subtracting the mean from each variable moves the reference point to 
# an average woman (BMI 32.5, age 33.2). The interaction test does not change 
# (Wald p = .188 in both versions). The main effects become readable again: 
# BMI OR 1.094 and Age OR 1.031, both p < .001.

round(cbind(OR = exp(coef(logit_int_c)), exp(confint.default(logit_int_c))), 4)

#Scaling to show with more clarity
# The interaction as a ratio of odds ratios: how the BMI effect (per 5 units)
# shifts for every 10 extra years of age
b <- coef(logit_int_c)
round(exp(b["BMI_c:Age_c"] * 5 * 10), 3)
round(exp(5 * (b["BMI_c"] + b["BMI_c:Age_c"] * c(-10, 0, 10, 20))), 2)

# RESULT: The BMI × Age interaction was not statistically significant
# (likelihood-ratio test p = .183; Wald test p = .188).

# REPORTING CHANGE: I will report the interaction odds ratio
# (OR = 1.0017, 95% CI 0.9992 to 1.0041) as evidence that there was no
# detectable interaction effect.

# INTERPRETATION: The effect of BMI on diabetes risk did not appear to
# change significantly across ages in this sample.

# REPORTING CHANGE: Because the interaction was not significant, I will
# focus on the main-effects model when interpreting the odds ratios.

# ============================================================
# MODEL 1 VS MODEL 2
# ============================================================
# QUESTION: Does adding the BMI by Age interaction improve the logistic regression model?

# ALTERNATIVES: Model 1 has the main effects; Model 2 adds BMI by Age.

# CHECK: Verify that both models use the same rows before comparing them.

# DECISION: Keep the more complex model only if the interaction improves the 
# model enough to justify it.

model1 <- glm(Outcome ~ BMI + Age + Glucose + Pregnancies, family = binomial, data = diab)
model2 <- glm(Outcome ~ BMI + Age + Glucose + Pregnancies + BMI:Age, family = binomial, data = diab)
c(nobs(model1), nobs(model2))
anova(model1, model2, test = "Chisq")
round(c(AIC_model1 = AIC(model1), AIC_model2 = AIC(model2)), 2)
round(cbind(OR = exp(coef(model1)), exp(confint.default(model1)),
            p = summary(model1)$coefficients[, 4]), 4)

# RESULT: Adding the BMI by Age interaction did not improve the model,
# likelihood-ratio chi-square(1) = 0.56, p = .453.

# REPORTING CHANGE: I kept the simpler Model 1 because the interaction did not
# improve fit, and Model 1 had the lower AIC.

# PRESENTATION: There was no reason to keep the extra complexity when it did
# not make the model better.

# UNEXPECTED OUTPUT: Age was significant in the earlier three-predictor
# logistic model, but it was no longer a significant independent predictor
# after Pregnancies was added to Model 1, p = .194.

# CHECK: My earlier correlation analysis showed a moderate positive
# relationship between Age and Pregnancies, r = .54.

# INTERPRETATION: Age and Pregnancies contain some overlapping information.
# After Pregnancies was added, Age did not contribute enough additional
# information to be statistically significant in Model 1.

# REPORTING CHANGE: Age will not be reported as a significant independent
# predictor in Model 1. This does not mean that Age has no relationship with
# diabetes. It means that Age was not significant after BMI, Glucose, and
# Pregnancies were considered together.

# LIMITATION: The correlation supports overlap as a possible explanation,
# but it does not prove that the correlation alone caused Age to lose
# statistical significance.

p1 <- predict(model1, newdata = diab, type = "response")
ok1 <- !is.na(p1)
classify(p1[ok1], diab$Outcome[ok1], cut = 0.5)
round(hosmer_lemeshow(diab$Outcome[ok1], p1[ok1]), 4)
# RESULT: Model 1 got 77.0% of the classifications correct overall.

# INTERPRETATION: It correctly identified 57.6% of the participants who 
# developed diabetes and 87.5% of those who did not. The model was much better at
# identifying participants who remained diabetes-free than those who developed diabetes.

# CHECK: The Hosmer-Lemeshow test gave chi-square(8) = 10.23, p = .249.

# INTERPRETATION: Because the p-value was above .05, the test did not find
# evidence that the model fitted the data poorly.

# LIMITATION: This does not prove that the model is a perfect fit. It only
# means that the Hosmer-Lemeshow test did not identify a significant
# problem with the fit.
# DECISION: I kept Model 1 because adding the BMI by Age interaction did not
# make the model better, p = .453. Model 1 also had the lower AIC,
# 722.90 compared with 724.33.

# PRESENTATION: The interaction added extra complexity without improving
# the model, so there was no good reason to keep it.

sessionInfo()