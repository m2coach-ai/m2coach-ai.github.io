# Load the package needed to read the SPSS file
library(haven)
# Load the health dataset
health <- read_sav("Health Data.sav")
dim(health)
names(health)
head(health[, c("sbp", "dbp")])
summary(health[, c("sbp", "dbp")])
colSums(is.na(health[, c("sbp", "dbp")]))
round(sapply(health[, c("sbp", "dbp")], sd), 2)
length(unique(health$sbp))
length(unique(health$dbp))
length(unique(health$ID_no))
sum(duplicated(health[, c("sbp", "dbp")]))
cor(health$sbp, health$dbp)
round(cor(health$sbp, health$dbp)^2, 3)
# ---- Correlation traps and what I learned ----

# Trap 1: cor() cannot use the entire health dataset because some columns
# contain text, such as the letters used in the sex column.

# cor(health) # This would cause an error because cor() needs numbers.

# I must name the two numerical columns that I want to compare.
cor(health$sbp, health$dbp)

# Another safe method is to select only the two numerical columns.
cor.test(health$sbp, health$dbp)
plot(health$sbp, health$dbp)
plot(health$sbp, health$dbp,
     xlab = "Systolic BP (mmHg)",
     ylab = "Diastolic BP (mmHg)",
     main = "Systolic vs diastolic blood pressure (n = 210)",
     pch  = 19,
     col  = rgb(36, 101, 95, alpha = 128, maxColorValue = 255))
plot(health$sbp, health$dbp,
     xlab = "Systolic BP (mmHg)",
     ylab = "Diastolic BP (mmHg)",
     main = "Systolic vs diastolic blood pressure (n = 210)",
     pch  = 19,
     col  = rgb(200, 30, 30, alpha = 128, maxColorValue = 255))

abline(lm(dbp ~ sbp, data = health), col = "black", lwd = 2)
# I used transparent red dots so repeated readings appear darker where dots overlap.
set.seed(42)
plot(jitter(health$sbp, amount = 0.5), jitter(health$dbp, amount = 0.5),
     xlab = "Systolic BP (mmHg)",
     ylab = "Diastolic BP (mmHg)",
     main = "Same data with jitter",
     pch  = 19,
     col  = rgb(36, 101, 95, alpha = 128, maxColorValue = 255))
abline(lm(dbp ~ sbp, data = health), col = "#8A4500", lwd = 2)
#with nudging I went back to original colour
png("bp_scatter.png", width = 900, height = 650, res = 120)
plot(health$sbp, health$dbp,
     xlab = "Systolic BP (mmHg)", ylab = "Diastolic BP (mmHg)",
     main = "Systolic vs diastolic blood pressure (n = 210)",
     pch = 19, col = rgb(36, 101, 95, alpha = 128, maxColorValue = 255))
abline(lm(dbp ~ sbp, data = health), col = "#8A4500", lwd = 2)
dev.off()
# I exported the finished plot from the Plots pane as bp_scatter.png.
# The png() method could automate this if the script needed to recreate the file.
fit <- lm(dbp ~ sbp, data = health)
round(coef(fit), 3)
round(summary(fit)$sigma, 1)
# ---- Reading the fitted line ----

# Create and store the line that best summarizes the relationship.
fit <- lm(dbp ~ sbp, data = health)

# Show the intercept and slope, rounded to three decimal places.
round(coef(fit), 3)

# The slope of 0.496 means that a 10 mmHg higher systolic reading
# is associated with about a 5 mmHg higher diastolic reading on average.

# Show the typical distance between the actual dots and the fitted line.
round(summary(fit)$sigma, 1)

# A result of 6.3 means an actual diastolic reading typically differs
# from the line's predicted reading by approximately 6.3 mmHg.
shapiro.test(health$sbp)
shapiro.test(health$dbp)
cor(health$sbp, health$dbp, method = "spearman")
cor.test(health$sbp, health$dbp, method = "spearman")
#A Spearman rank correlation, which does not assume normality, gave a similar result 
#(rho = 0.80), so the conclusion does not depend on the normality assumption.
#In these 210 participants, systolic and diastolic blood pressure had a strong positive relationship. 
#Pearson’s correlation was r = 0.847, with approximately 72% of the variation following the shared 
#linear pattern. Spearman’s correlation gave a similar result, rho = 0.802, 
#so the conclusion remained strong despite the variables not being perfectly normally distributed.