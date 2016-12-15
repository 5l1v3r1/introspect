# Overview

This document explores an RNN trained on the XOR task. The RNN itself is composed of an `LSTM(1,2)` followed by a `Dense(2,1)`. The RNN takes in a single binary digit at each timestep. The goal is to produce a highly-positive output if the current digit differs from the previous digit, producing a negative output otherwise.

# Results

The LSTM block has two outputs. The output layer produces a classification using approximately 5*out[0] - 10*out[1]. The first output mirrors the input fairly closely, so a positive input pressures the network to output a positive output. The second output's sign usually indicates if the current input is different than the previous input, and its higher coefficient tends to dominate. However, when the sequence ends with 001, the second cell is positive (incorrect), so the output gate covers up the second output and relies on the first output to produce the desired network classification (positive).

Interestingly, the first input value is always very nearly 1. The input gate for that input seems to vary between 0.6 and 1, tending towards lower values if more 1's have been seen recently. It seems that, for the first state, the output gate does most of the heavy lifting.

The second input value is approximately -1 for sequences ending in 10, or 1 otherwise. The result is that, after seeing 10, the second cell is negative, producing the correct (positive) output. There is one kink for sequences ending in 01. When the input is 0, the second remember gate is about 0; when the input is 1, the remember gate is about 0.5. Thus, after seeing 101, the second cell contains about -0.25, allowing us to produce the right output. However, after seeing 001, there was never a 10 to make the second cell negative. The result is that the second cell is positive, and the only possible recourse is to mask away the second cell using the output gate.

## Gate details

These are approximate values only, to give a rough sense of the values that each gate takes on based on the input sequence the RNN just saw. Regular expressions are used to express suffixes, e.g. \*1 is any sequence ending in a 1.

 * In[0] = 0.92 in + 0.74 out[0] + 0.76 out[1] + 3.09 internal[0] + 0.57
   * Always 1
 * In[1] = 5.55 in - 4.68 out[0] + 0.65 out[1] - 1.36 internal[1] + 2.44
   * -1 for \*10
   * 1 otherwise
 * InGate[0] = -0.90 in - 0.45 out[0] + 0.67 out[1] + 1.74 internal[0] + 0.13
   * Lower as we get more 1's (down to 0.6)
 * InGate[1] = -5.15 in + 8.50 out[0] - 0.52 out[1] + 2.24 internal[1] + 2.18
   * 0.2 for 001
   * 0 for 101
   * 1 otherwise
 * RemGate[0] = -3.62 in - 3.24 out[0] + 0.22 out[1] - 0.18 internal[0] + 3.52
   * 0.9 for \*00
   * 0 for \*11
   * 0.2 for \*01
   * 0.6 for \*10
 * RemGate[1] =  2.94 in + 0.70 out[0] - 0.18 out[1] + 0.37 internal[1] - 3.55
   * 0 for \*0
   * 0.5 for \*1
 * OutGate[0] =  7.22 in + 0.45 out[0] + 0.03 out[1] - 2.08 internal[0] + 1.96
   * 0 for \*0
   * 1 for \*1
 * OutGate[1] = -5.49 in + 8.27 out[0] - 5.00 out[1] + 2.52 internal[1] + 3.29
   * 0 for \*001
   * 1 otherwise

## Resultant States

This table indicates the results of running the RNN on the given sequence. The first row indicates the learned starting state.

----------------------------------------------------------
|    in    | Internal[0] | Internal[1] | Out[0] | Out[1] |
----------------------------------------------------------
|          |  2.44       | -0.73       |  0.15  | -1.53  |
|    00    |  4.03       |  0.94       |  0.00  |  0.67  |
|    10    |  1.72       | -0.93       |  0.21  | -0.73  |
|    000   |  4.83       |  0.93       |  0.00  |  0.67  |
|    001   |  2.37       |  0.62       |  0.97  |  0.01  |
|    010   |  2.06       | -0.96       |  0.13  | -0.74  |
|    011   |  0.99       |  1.30       |  0.76  |  0.86  |
|    100   |  2.50       |  0.86       |  0.04  |  0.70  |
|    101   |  1.22       | -0.26       |  0.84  | -0.24  |
|    110   |  1.50       | -0.85       |  0.27  | -0.66  |
|    111   |  0.77       |  1.44       |  0.65  |  0.87  |
----------------------------------------------------------

The following table indicates the resulting input values, input gates, remember gates, and output gates during the execution of the last timestep for the given sequence.

-------------------------------------------------------------------------------
| seq |  in0   |  in1   |  ing0  |  ing1  |  rem0  |  rem1  |  outg0 |  outg1 |
-------------------------------------------------------------------------------
| 000 |  1.000 |  0.919 |  1.000 |  0.981 |  0.950 |  0.035 |  0.000 |  0.911 |
| 001 |  1.000 |  1.000 |  0.999 |  0.233 |  0.339 |  0.408 |  0.986 |  0.019 |
| 010 |  1.000 | -0.993 |  0.970 |  1.000 |  0.503 |  0.065 |  0.130 |  1.000 |
| 011 |  1.000 |  0.992 |  0.930 |  0.998 |  0.026 |  0.568 |  0.999 |  1.000 |
| 100 |  1.000 |  0.978 |  0.927 |  0.908 |  0.915 |  0.026 |  0.040 |  1.000 |
| 101 |  1.000 |  1.000 |  0.839 |  0.054 |  0.223 |  0.339 |  0.999 |  0.927 |
| 110 |  0.999 | -0.895 |  0.848 |  1.000 |  0.795 |  0.053 |  0.303 |  0.960 |
| 111 |  1.000 |  0.999 |  0.695 |  0.987 |  0.094 |  0.517 |  1.000 |  0.970 |
-------------------------------------------------------------------------------
